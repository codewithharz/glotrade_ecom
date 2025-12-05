// src/services/BaseService.ts
import mongoose, { Model, Document, FilterQuery, UpdateQuery } from "mongoose";
import { NotFoundError } from "../utils/errors";

export class BaseService<T extends Document> {
  constructor(protected model: Model<T>) { }

  async findById(id: string): Promise<T> {
    const doc = await this.model.findById(id);
    if (!doc) {
      throw new NotFoundError(`No document found with id ${id}`);
    }
    return doc;
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T> {
    const doc = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      throw new NotFoundError(`No document found with id ${id}`);
    }
    return doc;
  }

  async delete(id: string): Promise<void> {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) {
      throw new NotFoundError(`No document found with id ${id}`);
    }
  }

  /**
   * Executes a callback within a MongoDB transaction.
   * If the environment does not support transactions (e.g., standalone instance),
   * it falls back to executing without a transaction.
   */
  async executeTransaction<R>(callback: (session?: mongoose.ClientSession) => Promise<R>): Promise<R> {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error: any) {
      await session.abortTransaction();

      // Check for standalone instance error (Code 20: IllegalOperation)
      if (
        error.code === 20 ||
        error.codeName === 'IllegalOperation' ||
        (error.message && error.message.includes("Transaction numbers are only allowed on a replica set member"))
      ) {
        console.warn("MongoDB Transaction failed (likely standalone instance). Retrying without transaction.");
        return callback();
      }

      throw error;
    } finally {
      session.endSession();
    }
  }
}
