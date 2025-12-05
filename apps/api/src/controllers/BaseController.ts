// src/controllers/BaseController.ts
// Express types handled by any
import { Document, FilterQuery, Model } from "mongoose";
import { BaseService } from "../services/BaseService";
import { IUser } from "../types/user.types"; // Import IUser type
import { UserService } from "../services/UserService"; // Import UserService

export interface QueryOptions {
  sort?: string;
  fields?: string;
  page?: number;
  limit?: number;
}

export class BaseController<T extends Document> {
  constructor(protected service: BaseService<T>) {}

  protected sanitizeQuery(query: Record<string, any>): {
    filter: Record<string, any>;
    options: QueryOptions;
  } {
    const sanitized: Record<string, any> = {};
    const options: QueryOptions = {};

    Object.entries(query).forEach(([key, value]) => {
      // Handle special query parameters
      if (key === "sort") {
        options.sort = String(value);
        return;
      }
      if (key === "fields") {
        options.fields = String(value);
        return;
      }
      if (key === "page") {
        options.page = Math.max(1, Number(value));
        return;
      }
      if (key === "limit") {
        options.limit = Math.max(1, Math.min(100, Number(value)));
        return;
      }

      // Handle numeric values
      if (!isNaN(Number(value))) {
        sanitized[key] = Number(value);
        return;
      }

      // Handle boolean values
      if (value === "true" || value === "false") {
        sanitized[key] = value === "true";
        return;
      }

      // Handle array values
      if (typeof value === "string" && value.includes(",")) {
        sanitized[key] = { $in: value.split(",") };
        return;
      }

      // Handle string values
      if (typeof value === "string") {
        sanitized[key] = value;
      }
    });

    return { filter: sanitized, options };
  }

  getAll = async (req: any, res: any, next: any) => {
    try {
      const { filter, options } = this.sanitizeQuery(req.query);
      const docs = await this.service.findAll(filter);

      res.status(200).json({
        status: "success",
        results: docs.length,
        data: docs,
      });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: any, res: any, next: any) => {
    try {
      const doc = await this.service.findById(req.params.id);
      res.status(200).json({
        status: "success",
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: any, res: any, next: any) => {
    try {
      const doc = await this.service.create(req.body as Partial<T>);
      res.status(201).json({
        status: "success",
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: any, res: any, next: any) => {
    try {
      const doc = await this.service.update(
        req.params.id,
        req.body as Partial<T>
      );
      res.status(200).json({
        status: "success",
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: any, res: any, next: any) => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}

// Example usage with specific controller
export class UserController extends BaseController<IUser> {
  constructor(userService: UserService) {
    super(userService);
    this.userService = userService;
  }

  private userService: UserService;

  async findByAddress(req: any, res: any, next: any) {
    try {
      const user = await this.userService.findByAddress(req.params.address);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  getAll = async (req: any, res: any, next: any) => {
    try {
      const { filter, options } = this.sanitizeQuery(req.query);

      // Add custom filters for users
      if (req.query.role) {
        filter.role = req.query.role as string;
      }

      const docs = await this.service.findAll(filter);

      res.status(200).json({
        status: "success",
        results: docs.length,
        data: docs,
      });
    } catch (error) {
      next(error);
    }
  };
}
