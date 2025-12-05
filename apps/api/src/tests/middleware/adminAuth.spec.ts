// apps/api/src/tests/middleware/adminAuth.spec.ts
import { Request, Response, NextFunction } from 'express';
import { adminAuth, superAdminAuth, roleBasedAdminAuth } from '../../middleware/adminAuth';
import { AuthRequest } from '../../middleware/auth';
import { ForbiddenError } from '../../utils/errors';

// Mock user data
const mockAdminUser = {
  _id: 'admin123',
  username: 'admin',
  role: 'admin',
  isSuperAdmin: false,
  email: 'admin@example.com'
};

const mockSuperAdminUser = {
  _id: 'superadmin123',
  username: 'superadmin',
  role: 'buyer',
  isSuperAdmin: true,
  email: 'superadmin@example.com'
};

const mockRegularUser = {
  _id: 'user123',
  username: 'user',
  role: 'buyer',
  isSuperAdmin: false,
  email: 'user@example.com'
};

// Mock response and next function
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as unknown as Response;

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

describe('Admin Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log
  });

  describe('adminAuth', () => {
    it('should allow admin users to pass through', () => {
      const mockRequest = {
        user: mockAdminUser
      } as AuthRequest;

      adminAuth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(console.log).toHaveBeenCalledWith('Admin access granted:', expect.objectContaining({
        userId: 'admin123',
        username: 'admin',
        role: 'admin',
        isSuperAdmin: false
      }));
    });

    it('should allow super admin users to pass through', () => {
      const mockRequest = {
        user: mockSuperAdminUser
      } as AuthRequest;

      adminAuth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(console.log).toHaveBeenCalledWith('Admin access granted:', expect.objectContaining({
        userId: 'superadmin123',
        username: 'superadmin',
        role: 'buyer',
        isSuperAdmin: true
      }));
    });

    it('should reject regular users', () => {
      const mockRequest = {
        user: mockRegularUser
      } as AuthRequest;

      adminAuth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Admin access required. Insufficient privileges.');
    });

    it('should reject requests without user', () => {
      const mockRequest = {} as AuthRequest;

      adminAuth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Authentication required for admin access');
    });
  });

  describe('superAdminAuth', () => {
    it('should allow super admin users to pass through', () => {
      const mockRequest = {
        user: mockSuperAdminUser
      } as AuthRequest;

      superAdminAuth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(console.log).toHaveBeenCalledWith('Super admin access granted:', expect.objectContaining({
        userId: 'superadmin123',
        username: 'superadmin',
        role: 'buyer',
        isSuperAdmin: true
      }));
    });

    it('should reject regular admin users', () => {
      const mockRequest = {
        user: mockAdminUser
      } as AuthRequest;

      superAdminAuth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Super admin access required. Insufficient privileges.');
    });

    it('should reject regular users', () => {
      const mockRequest = {
        user: mockRegularUser
      } as AuthRequest;

      superAdminAuth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Super admin access required. Insufficient privileges.');
    });

    it('should reject requests without user', () => {
      const mockRequest = {} as AuthRequest;

      superAdminAuth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Authentication required for super admin access');
    });
  });

  describe('roleBasedAdminAuth', () => {
    it('should allow users with allowed roles to pass through', () => {
      const mockRequest = {
        user: mockAdminUser
      } as AuthRequest;

      const middleware = roleBasedAdminAuth(['admin'], false);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(console.log).toHaveBeenCalledWith('Role-based admin access granted:', expect.objectContaining({
        userId: 'admin123',
        username: 'admin',
        role: 'admin',
        isSuperAdmin: false,
        allowedRoles: ['admin'],
        requireSuperAdmin: false
      }));
    });

    it('should allow super admin users to pass through regardless of role requirement', () => {
      const mockRequest = {
        user: mockSuperAdminUser
      } as AuthRequest;

      const middleware = roleBasedAdminAuth(['admin'], false);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(console.log).toHaveBeenCalledWith('Role-based admin access granted:', expect.objectContaining({
        userId: 'superadmin123',
        username: 'superadmin',
        role: 'buyer',
        isSuperAdmin: true,
        allowedRoles: ['admin'],
        requireSuperAdmin: false
      }));
    });

    it('should reject users without allowed roles', () => {
      const mockRequest = {
        user: mockRegularUser
      } as AuthRequest;

      const middleware = roleBasedAdminAuth(['admin'], false);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Access denied. Required roles: admin or super admin');
    });

    it('should require super admin access when specified', () => {
      const mockRequest = {
        user: mockAdminUser
      } as AuthRequest;

      const middleware = roleBasedAdminAuth(['admin'], true);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Super admin access required for this operation');
    });

    it('should allow super admin users when super admin access is required', () => {
      const mockRequest = {
        user: mockSuperAdminUser
      } as AuthRequest;

      const middleware = roleBasedAdminAuth(['admin'], true);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(console.log).toHaveBeenCalledWith('Role-based admin access granted:', expect.objectContaining({
        userId: 'superadmin123',
        username: 'superadmin',
        role: 'buyer',
        isSuperAdmin: true,
        allowedRoles: ['admin'],
        requireSuperAdmin: true
      }));
    });

    it('should reject requests without user', () => {
      const mockRequest = {} as AuthRequest;

      const middleware = roleBasedAdminAuth(['admin'], false);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Authentication required for admin access');
    });
  });
}); 