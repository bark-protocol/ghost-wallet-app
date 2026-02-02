import { createHash } from 'crypto';
import type { LedgerEntry, Transaction } from '../types';

export interface LedgerStorage {
  append(entry: LedgerEntry): Promise<void>;
  getEntry(id: string): Promise<LedgerEntry | null>;
  getEntriesByTransaction(transactionId: string): Promise<LedgerEntry[]>;
  getLatestEntry(): Promise<LedgerEntry | null>;
  getAllEntries(limit?: number): Promise<LedgerEntry[]>;
}

export class ImmutableLedger {
  private storage: LedgerStorage;

  constructor(storage: LedgerStorage) {
    this.storage = storage;
  }

  async recordAction(
    transactionId: string,
    action: string,
    actor: string,
    data: Record<string, unknown>,
    actorRole?: string
  ): Promise<LedgerEntry> {
    const latestEntry = await this.storage.getLatestEntry();
    const previousHash = latestEntry?.hash;

    const entry: LedgerEntry = {
      id: this.generateId(),
      transactionId,
      timestamp: new Date(),
      action,
      actor,
      actorRole,
      data,
      hash: '', // Will be computed
      previousHash,
    };

    // Compute hash for immutability
    entry.hash = this.computeHash(entry);

    await this.storage.append(entry);
    return entry;
  }

  async getTransactionHistory(transactionId: string): Promise<LedgerEntry[]> {
    return this.storage.getEntriesByTransaction(transactionId);
  }

  async verifyIntegrity(entries?: LedgerEntry[]): Promise<{
    valid: boolean;
    invalidEntries: string[];
  }> {
    const entriesToVerify = entries || await this.storage.getAllEntries();
    const invalidEntries: string[] = [];

    for (let i = 0; i < entriesToVerify.length; i++) {
      const entry = entriesToVerify[i];
      
      // Verify hash
      const computedHash = this.computeHash(entry);
      if (entry.hash !== computedHash) {
        invalidEntries.push(entry.id);
        continue;
      }

      // Verify chain
      if (i > 0) {
        const previousEntry = entriesToVerify[i - 1];
        if (entry.previousHash !== previousEntry.hash) {
          invalidEntries.push(entry.id);
        }
      }
    }

    return {
      valid: invalidEntries.length === 0,
      invalidEntries,
    };
  }

  async getAuditTrail(options: {
    transactionId?: string;
    actor?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<LedgerEntry[]> {
    let entries = await this.storage.getAllEntries(options.limit);

    if (options.transactionId) {
      entries = entries.filter(e => e.transactionId === options.transactionId);
    }

    if (options.actor) {
      entries = entries.filter(e => e.actor === options.actor);
    }

    if (options.startDate) {
      entries = entries.filter(e => e.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      entries = entries.filter(e => e.timestamp <= options.endDate!);
    }

    return entries;
  }

  private computeHash(entry: LedgerEntry): string {
    const data = {
      id: entry.id,
      transactionId: entry.transactionId,
      timestamp: entry.timestamp.toISOString(),
      action: entry.action,
      actor: entry.actor,
      actorRole: entry.actorRole,
      data: entry.data,
      previousHash: entry.previousHash,
    };

    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

// In-memory storage implementation for testing/demo
export class InMemoryLedgerStorage implements LedgerStorage {
  private entries: LedgerEntry[] = [];

  async append(entry: LedgerEntry): Promise<void> {
    this.entries.push(entry);
  }

  async getEntry(id: string): Promise<LedgerEntry | null> {
    return this.entries.find(e => e.id === id) || null;
  }

  async getEntriesByTransaction(transactionId: string): Promise<LedgerEntry[]> {
    return this.entries.filter(e => e.transactionId === transactionId);
  }

  async getLatestEntry(): Promise<LedgerEntry | null> {
    return this.entries[this.entries.length - 1] || null;
  }

  async getAllEntries(limit?: number): Promise<LedgerEntry[]> {
    if (limit) {
      return this.entries.slice(-limit);
    }
    return [...this.entries];
  }
}

export function createLedger(storage?: LedgerStorage): ImmutableLedger {
  return new ImmutableLedger(storage || new InMemoryLedgerStorage());
}
