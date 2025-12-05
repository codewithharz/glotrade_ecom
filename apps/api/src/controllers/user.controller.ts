// src/controllers/UserController.ts
// Express types handled by any
import { AuthRequest } from "../types/custom";
import { BaseController } from "./BaseController";
import { UserService } from "../services/UserService";
import { IUser, IUserBase, UserRole } from "../types/user.types";
import { ValidationError } from "../utils/errors";

// Create a type alias for our extended request

export class UserController extends BaseController<IUser> {
  private userService: UserService;

  constructor(userService: UserService) {
    super(userService);
    this.userService = userService;
  }

  register = async (req: any, res: any, next: any) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  findByAddress = async (req: any, res: any, next: any) => {
    try {
      const user = await this.userService.findByAddress(req.params.address);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: any, res: any, next: any) => {
    try {
      const user = await this.userService.updateProfile(
        req.params.id,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      // Allow updating preferences in addition to profile fields
      const patch: any = { ...req.body };
      const user = await this.userService.updateById(req.user.id, patch);
      res.status(200).json({ status: "success", data: user });
    } catch (error) { next(error); }
  };

  verifyUser = async (req: any, res: any, next: any) => {
    try {
      const user = await this.userService.verifyUser(req.params.id);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current user profile with walletId
  getProfile = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const user = await this.userService.findById(req.user.id);
      if (!user) throw new ValidationError("User not found");
      
      // Ensure user has walletId (for existing users who might not have it)
      const walletId = await this.userService.ensureWalletId(req.user.id);
      user.walletId = walletId;
      
      res.status(200).json({
        status: "success",
        data: {
          id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
          walletId: user.walletId,
          emailVerified: user.emailVerified,
          profileImage: user.profileImage,
          country: user.country,
          phone: user.phone,
          reputation: user.reputation,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getVerifiedSellers = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const sellers = await this.userService.findVerifiedSellers();
      res.status(200).json({
        status: "success",
        results: sellers.length,
        data: sellers,
      });
    } catch (error) {
      next(error);
    }
  };

  // Account deletion methods
  requestAccountDeletion = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const { reason } = req.body;
      const user = await this.userService.findById(req.user.id);
      if (!user) throw new ValidationError("User not found");
      
      await user.requestAccountDeletion(reason);
      
      res.json({
        status: "success",
        message: "Account deletion requested. You have 60 days to reactivate your account.",
        data: {
          deletionRequestedAt: user.deletionRequestedAt,
          gracePeriodEndsAt: user.gracePeriodEndsAt,
          canDelete: user.canDelete
        }
      });
    } catch (error) {
      // Handle specific error for unsettled orders
      if (error instanceof Error && error.message.includes('unsettled order')) {
        return res.status(400).json({
          status: "error",
          message: error.message,
          code: "UNSETTLED_ORDERS"
        });
      }
      
      // For other errors, pass to global error handler
      next(error);
    }
  };

  reactivateAccount = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const user = await this.userService.findById(req.user.id);
      if (!user) throw new ValidationError("User not found");
      
      await user.reactivateAccount();
      
      res.json({
        status: "success",
        message: "Account reactivated successfully!",
        data: {
          isDeletionRequested: user.isDeletionRequested,
          canDelete: user.canDelete
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getDeletionStatus = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      const user = await this.userService.findById(req.user.id);
      if (!user) throw new ValidationError("User not found");
      
      const deletionCheck = await user.canDeleteAccount();
      
      res.json({
        status: "success",
        data: {
          isDeletionRequested: user.isDeletionRequested,
          deletionRequestedAt: user.deletionRequestedAt,
          gracePeriodEndsAt: user.gracePeriodEndsAt,
          deletionReason: user.deletionReason,
          ...deletionCheck
        }
      });
    } catch (error) {
      next(error);
    }
  };

  createAdmin = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        throw new ValidationError("Authentication required");
      }

      const adminData: Partial<IUserBase> = {
        ...req.body,
        role: "admin" as UserRole,
      };

      const admin = await this.userService.createAdmin(adminData, req.user);
      res.status(201).json({
        status: "success",
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: any, res: any, next: any) => {
    try {
      const users = await this.userService.findAll({});
      res.status(200).json({
        status: "success",
        results: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: any, res: any, next: any) => {
    try {
      const user = await this.userService.blockUser(req.params.id);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  unBlockUser = async (req: any, res: any, next: any) => {
    try {
      const user = await this.userService.unBlockUser(req.params.id);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  changeUserRole = async (req: any, res: any, next: any) => {
    try {
      const { role } = req.body;

      if (!["buyer", "seller", "admin"].includes(role)) {
        throw new ValidationError("Invalid role");
      }

      const user = await this.userService.changeUserRole(
        req.params.id,
        role as UserRole
      );

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current authenticated user data
  getMe = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      
      // Return complete user data including firstName/lastName
      const user = await this.userService.findById(req.user.id);
      if (!user) throw new ValidationError("User not found");
      
      // Ensure user has walletId (for existing users who might not have it)
      const walletId = await this.userService.ensureWalletId(req.user.id);
      user.walletId = walletId;
      
      res.json({
        status: "success",
        data: {
          id: user._id,
          email: user.email,
          username: user.username,
          emailVerified: user.emailVerified,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin || false,
          isVerified: user.isVerified,
          walletId: user.walletId,
          reputation: user.reputation,
          totalTransactions: user.totalTransactions,
          tokenBalance: user.tokenBalance,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Persist / load wishlist + cart for the authenticated user
  getStorage = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const user = await this.userService.findById(req.user.id);
      res.json({ status: "success", data: { wishlist: user?.wishlist || [], cart: user?.cart || [] } });
    } catch (error) { next(error); }
  };

  saveStorage = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const { wishlist, cart } = req.body || {};
      const user = await this.userService.updateById(req.user.id, {
        wishlist: Array.isArray(wishlist) ? wishlist : undefined,
        cart: Array.isArray(cart) ? cart : undefined,
      } as Partial<IUser>);
      res.json({ status: "success", data: { wishlist: user?.wishlist || [], cart: user?.cart || [] } });
    } catch (error) { next(error); }
  };

  // Addresses CRUD for authenticated user
  listAddresses = async (req: any, res: any, next: any) => {
    try { if (!req.user) throw new ValidationError("Authentication required"); const u = await this.userService.findById(req.user.id); res.json({ status: "success", data: u?.addresses || [] }); } catch (e) { next(e); }
  };
  addAddress = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const addr = req.body || {};
      // first address becomes default if none exist
      const u = await this.userService.findById(req.user.id);
      const list = Array.isArray((u as any).addresses) ? (u as any).addresses : [];
      if (!addr.id) addr.id = (global as any).crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
      if (list.length === 0) addr.isDefault = true;
      let next: any[] = [...list, addr];
      // Enforce single default
      if (addr.isDefault) {
        next = next.map((a: any) => ({ ...a, isDefault: a.id === addr.id }));
      } else {
        const defaults = next.filter((a: any) => a.isDefault);
        if (defaults.length > 1) {
          const keep = defaults[0]?.id as string | undefined;
          next = next.map((a: any) => ({ ...a, isDefault: keep ? a.id === keep : false }));
        }
      }
      await this.userService.updateById(req.user.id, { addresses: next } as any);
      res.json({ status: "success", data: next });
    } catch (e) { next(e); }
  };
  updateAddress = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const id = req.params.id;
      const patch = req.body || {};
      const u = await this.userService.findById(req.user.id);
      const list = Array.isArray((u as any).addresses) ? (u as any).addresses : [];
      let found = false;
      let next: any[] = list.map((a: any) => {
        if (a.id === id) { found = true; return { ...a, ...patch }; }
        return a;
      });
      if (!found) {
        const toAdd: any = { id, ...patch };
        if (next.length === 0) (toAdd as any).isDefault = true;
        next.push(toAdd);
      }
      // Enforce single default if caller sets isDefault
      if (patch.isDefault) {
        next = next.map((a: any) => ({ ...a, isDefault: a.id === id }));
      } else {
        const defaults = next.filter((a: any) => a.isDefault);
        if (defaults.length > 1) {
          const keep = defaults[0]?.id as string | undefined;
          next = next.map((a: any) => ({ ...a, isDefault: keep ? a.id === keep : false }));
        }
      }
      
      // Prepare update data: addresses + user profile fields
      const updateData: any = { addresses: next };
      
      // If firstName/lastName are provided, update user profile fields
      if (patch.firstName !== undefined) updateData.firstName = patch.firstName;
      if (patch.lastName !== undefined) updateData.lastName = patch.lastName;
      
      // Update both addresses and user profile fields
      await this.userService.updateById(req.user.id, updateData);
      
      // Return updated user data to confirm all changes
      const updatedUser = await this.userService.findById(req.user.id);
      res.json({ 
        status: "success", 
        data: updatedUser?.addresses || [],
        user: {
          firstName: updatedUser?.firstName,
          lastName: updatedUser?.lastName
        }
      });
    } catch (e) { next(e); }
  };
  deleteAddress = async (req: any, res: any, next: any) => {
    try { if (!req.user) throw new ValidationError("Authentication required"); const id = req.params.id; const u = await this.userService.findById(req.user.id); const list = Array.isArray((u as any).addresses) ? (u as any).addresses : []; const next = list.filter((a: any)=> a.id !== id); if (!next.some((a:any)=> a.isDefault) && next[0]) next[0].isDefault = true; await this.userService.updateById(req.user.id, { addresses: next } as any); res.json({ status: "success", data: next }); } catch (e) { next(e); }
  };
  setDefaultAddress = async (req: any, res: any, next: any) => {
    try { if (!req.user) throw new ValidationError("Authentication required"); const id = req.params.id; const u = await this.userService.findById(req.user.id); const list = Array.isArray((u as any).addresses) ? (u as any).addresses : []; const next = list.map((a:any)=> ({ ...a, isDefault: a.id === id })); await this.userService.updateById(req.user.id, { addresses: next } as any); res.json({ status: "success", data: next }); } catch (e) { next(e); }
  };
}
