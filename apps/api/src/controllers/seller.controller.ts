// Express types handled by any
import { AuthRequest } from "../middleware/auth";
import Seller from "../models/Seller";
import { ValidationError } from "../utils/errors";
import User from "../models/User";
import Product from "../models/Product";
import { MarketService } from "../services/MarketService";
import { ProductCondition } from "../types/product.types";
import SellerFollow from "../models/SellerFollow";

function slugify(input: string): string {
  return String(input).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export class SellerController {
  private market = new MarketService();
  upsert = async (req: any, res: any, next: any) => {
    try { if (!req.user) throw new ValidationError("Authentication required"); const body = req.body || {}; const name = String(body.name || req.user.username || ""); if (!name) throw new ValidationError("name is required"); const slug = body.slug ? slugify(body.slug) : slugify(name); const doc = await Seller.findOneAndUpdate({ userId: req.user.id }, { ...body, name, slug, userId: req.user.id }, { new: true, upsert: true }); res.json({ status: 'success', data: doc }); } catch (e) { next(e as any); }
  };

  me = async (req: any, res: any, next: any) => {
    try { if (!req.user) throw new ValidationError("Authentication required"); const doc = await Seller.findOne({ userId: req.user.id }); res.json({ status: 'success', data: doc }); } catch (e) { next(e as any); }
  };

  getBySlug = async (req: any, res: any, next: any) => {
    try {
      const { slug } = req.params as any;
      let doc = await Seller.findOne({ slug });
      if (!doc) {
        // Fallback: infer from User.store if Seller doc not created yet
        const users = await User.find({ role: 'seller' });
        const found = (users as any[]).find((u) => slugify(u.store?.name || "") === slug);
        if (found) {
          doc = await Seller.findOneAndUpdate({ userId: found._id }, {
            userId: found._id,
            slug,
            name: found.store?.name || found.username,
            description: found.store?.description,
            logoUrl: found.store?.logoUrl || found.profileImage, // Use profileImage as fallback
            country: found.country,
          }, { new: true, upsert: true });
        }
      }
      if (!doc) throw new ValidationError('Seller not found');
      
      // Get comprehensive vendor metrics
      const metrics = await this.market.getVendorMetrics(doc.userId.toString());
      
      // Get user data for additional fields like profileImage
      const userData = await User.findById(doc.userId).select('profileImage store');
      
      // augment with accurate followersCount from join table
      try {
        const count = await SellerFollow.countDocuments({ sellerId: doc._id });
        (doc as any)._doc.followers = Array.isArray((doc as any).followers) ? (doc as any).followers : [];
        // Note: we keep the array for backward compatibility, the count used by client is authoritative
        res.json({ 
          status: 'success', 
          data: { 
            ...doc.toObject(), 
            followersCount: count,
            profileImage: userData?.profileImage, // Include profileImage as fallback
            ...metrics
          } 
        });
      } catch {
        res.json({ 
          status: 'success', 
          data: { 
            ...doc.toObject(),
            profileImage: userData?.profileImage, // Include profileImage as fallback
            ...metrics
          } 
        });
      }
    } catch (e) { next(e as any); }
  };

  productsBySlug = async (req: any, res: any, next: any) => {
    try {
      const { slug } = req.params as any;
      let seller = await Seller.findOne({ slug });
      if (!seller) {
        const users = await User.find({ role: 'seller' });
        const found = (users as any[]).find((u) => slugify(u.store?.name || "") === slug);
        if (found) {
          seller = await Seller.findOneAndUpdate({ userId: found._id }, { userId: found._id, slug, name: found.store?.name || found.username, description: found.store?.description, logoUrl: found.store?.logoUrl || found.profileImage, country: found.country }, { new: true, upsert: true });
        }
      }
      if (!seller) throw new ValidationError('Seller not found');
      const items = await Product.find({ seller: seller.userId, status: { $ne: 'suspended' } }).sort({ createdAt: -1 });
      res.json({ status: 'success', data: items });
    } catch (e) { next(e as any); }
  };

  searchBySlug = async (req: any, res: any, next: any) => {
    try {
      const { slug } = req.params as any;
      const seller = await Seller.findOne({ slug });
      if (!seller) throw new ValidationError('Seller not found');
      const q = req.query as any;
      const results = await this.market.searchProducts({
        query: q.query as string,
        category: q.category as string,
        minPrice: q.minPrice ? Number(q.minPrice) : undefined,
        maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
        condition: q.condition as ProductCondition,
        location: q.location as string,
        sort: q.sort as string,
        page: q.page ? Number(q.page) : 1,
        limit: q.limit ? Number(q.limit) : 30,
        brand: q.brand as string,
        ratingMin: q.ratingMin ? Number(q.ratingMin) : undefined,
        verifiedSeller: q.verifiedSeller === 'true',
        freeShipping: q.freeShipping === 'true',
        etaMaxDays: q.etaMaxDays ? Number(q.etaMaxDays) : undefined,
        discountMin: q.discountMin ? Number(q.discountMin) : undefined,
        createdSinceDays: q.createdSinceDays ? Number(q.createdSinceDays) : undefined,
        sellerId: String(seller.userId),
        attributes: Object.fromEntries(
          Object.entries(q).filter(([k]: [string, any]) => k.startsWith('attr_')).map(([k,v]: [string, any]) => [k.replace('attr_',''), String(v)])
        )
      });
      res.json({ status: 'success', data: results });
    } catch (e) { next(e as any); }
  };

  follow = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError('Authentication required');
      const { slug } = req.params as any;
      const seller = await Seller.findOne({ slug });
      if (!seller) throw new ValidationError('Seller not found');
      const uid = req.user.id;
      // upsert in join table and keep denormalized count
      await SellerFollow.updateOne({ userId: uid, sellerId: seller._id }, { $setOnInsert: { userId: uid, sellerId: seller._id } }, { upsert: true });
      await Seller.updateOne({ _id: seller._id }, { $addToSet: { followers: uid } });
      const count = await SellerFollow.countDocuments({ sellerId: seller._id });
      res.json({ status: 'success', data: { following: true, followersCount: count } });
    } catch (e) { next(e as any); }
  };

  unfollow = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError('Authentication required');
      const { slug } = req.params as any;
      const seller = await Seller.findOne({ slug });
      if (!seller) throw new ValidationError('Seller not found');
      const uid = req.user.id;
      await SellerFollow.deleteOne({ userId: uid, sellerId: seller._id });
      await Seller.updateOne({ _id: seller._id }, { $pull: { followers: uid } });
      const count = await SellerFollow.countDocuments({ sellerId: seller._id });
      res.json({ status: 'success', data: { following: false, followersCount: count } });
    } catch (e) { next(e as any); }
  };
}

export default new SellerController();

