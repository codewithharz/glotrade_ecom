// src/tests/services/market.service.spec.ts
import { describe, it, before, beforeEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { MarketService } from "../../services/MarketService";
import { TokenService } from "../../services/TokenService";
import { NotificationService } from "../../services/NotificationService";
import { ValidationError } from "../../utils/errors";

describe("MarketService", () => {
  let marketService: MarketService;
  let tokenService: TokenService;
  let notificationService: NotificationService;
  let sandbox: sinon.SinonSandbox;

  before(() => {
    tokenService = new TokenService();
    notificationService = new NotificationService();
    marketService = new MarketService(tokenService, notificationService);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createProduct", () => {
    it("should create a new product with valid data", async () => {
      const productData = {
        title: "Test Product",
        description: "Test Description",
        price: 100,
        seller: "seller123",
        category: "electronics",
      };

      const createProductStub = sandbox
        .stub(marketService["model"], "create")
        .resolves({ ...productData, _id: "product123" });

      const result = await marketService.createProduct(productData);

      expect(result).to.have.property("_id", "product123");
      expect(result).to.include(productData);
      expect(createProductStub.calledOnce).to.be.true;
    });

    it("should throw ValidationError for invalid data", async () => {
      const invalidData = {
        title: "", // Invalid empty title
        price: -100, // Invalid negative price
      };

      try {
        await marketService.createProduct(invalidData);
        expect.fail("Should have thrown ValidationError");
      } catch (error) {
        expect(error).to.be.instanceOf(ValidationError);
      }
    });
  });

  describe("searchProducts", () => {
    it("should return filtered products based on search criteria", async () => {
      const searchFilters = {
        query: "test",
        category: "electronics",
        minPrice: 50,
        maxPrice: 200,
      };

      const mockProducts = [
        { _id: "prod1", title: "Test Product 1", price: 100 },
        { _id: "prod2", title: "Test Product 2", price: 150 },
      ];

      const findStub = sandbox
        .stub(marketService["model"], "find")
        .resolves(mockProducts);

      const result = await marketService.searchProducts(searchFilters);

      expect(result.products).to.have.lengthOf(2);
      expect(findStub.calledOnce).to.be.true;
      expect(findStub.firstCall.args[0]).to.deep.include({
        price: { $gte: 50, $lte: 200 },
      });
    });
  });

  // More test cases...
});
