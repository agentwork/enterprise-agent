import { getClients, getClient, createClient, updateClient, deleteClient, getDeals, getDealsByClient, getDeal, createDeal, updateDeal, deleteDeal, getActivitiesByClient, getActivitiesByDeal, createActivity, deleteActivity } from "./actions";
import { db } from "@/lib/db";
import { clients, deals, activities } from "@/lib/db/schema/crm";
import { eq } from "drizzle-orm";

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock the db module
jest.mock("@/lib/db", () => {
  return {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      orderBy: jest.fn(),
      query: {
        clients: {
          findFirst: jest.fn(),
        },
        deals: {
          findFirst: jest.fn(),
        },
        activities: {
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    },
  };
});

describe("CRM Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getClients", () => {
    it("should fetch clients successfully", async () => {
      const mockClients = [{ id: "1", name: "Client 1" }];
      (db.select().from(clients).orderBy as jest.Mock).mockResolvedValue(mockClients);

      const result = await getClients();

      expect(db.select).toHaveBeenCalled();
      expect(db.select().from).toHaveBeenCalledWith(clients);
      expect(result).toEqual({ success: true, data: mockClients });
    });

    it("should handle errors", async () => {
      (db.select().from(clients).orderBy as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const result = await getClients();

      expect(result).toEqual({ success: false, error: "Failed to fetch clients" });
    });
  });

  describe("getClient", () => {
    it("should fetch a client by id", async () => {
      const mockClient = { id: "1", name: "Client 1" };
      (db.query.clients.findFirst as jest.Mock).mockResolvedValue(mockClient);

      const result = await getClient("1");

      expect(db.query.clients.findFirst).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockClient });
    });

    it("should return error if client not found", async () => {
      (db.query.clients.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getClient("1");

      expect(result).toEqual({ success: false, error: "Client not found" });
    });
  });

  describe("createClient", () => {
    it("should create a client successfully", async () => {
      const input = { name: "New Client" };
      const mockCreatedClient = { id: "1", name: "New Client" };
      (db.insert(clients).values(input).returning as jest.Mock).mockResolvedValue([mockCreatedClient]);

      const result = await createClient(input);

      expect(db.insert).toHaveBeenCalledWith(clients);
      expect(result).toEqual({ success: true, data: mockCreatedClient });
    });

    it("should validate input", async () => {
      const input = { name: "" }; // Invalid name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await createClient(input as any);

      expect(result.success).toBe(false);
      // Zod error message
      expect(result.error).toContain("Name is required");
    });
  });

  describe("updateClient", () => {
    it("should update a client successfully", async () => {
      const validId = "123e4567-e89b-12d3-a456-426614174000";
      const input = { id: validId, name: "Updated Client" };
      const mockUpdatedClient = { id: validId, name: "Updated Client" };
      (db.update(clients).set(input).where(eq(clients.id, validId)).returning as jest.Mock).mockResolvedValue([mockUpdatedClient]);

      const result = await updateClient(input);

      expect(db.update).toHaveBeenCalledWith(clients);
      expect(result).toEqual({ success: true, data: mockUpdatedClient });
    });

    it("should return error if id is missing", async () => {
        const input = { name: "Updated Client" }; // Missing id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await updateClient(input as any);
  
        // Zod validation fails because id is required
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      });
  });

  describe("deleteClient", () => {
    it("should delete a client successfully", async () => {
      const validId = "123e4567-e89b-12d3-a456-426614174000";
      // We don't need to mock return value of where() because it returns 'this' (the mock object)
      // and await checks for thenable or just returns the value.
      // Since our mock object is not thenable by default, await returns it immediately.
      // But db.delete(...).where(...) returns the mock object.
      // The code awaits it. If it's not a promise, it continues.
      // But typically drizzle returns a promise.
      // If we want to simulate async, we should make where return a Promise that resolves to undefined.
      // But let's see if default behavior works (it should just return the mock object).
      
      const result = await deleteClient(validId);

      expect(db.delete).toHaveBeenCalledWith(clients);
      expect(result).toEqual({ success: true });
    });
  });

  // --- Deals ---
  describe("getDeals", () => {
    it("should fetch deals successfully", async () => {
      const mockDeals = [{ id: "1", title: "Deal 1" }];
      (db.select().from(deals).orderBy as jest.Mock).mockResolvedValue(mockDeals);

      const result = await getDeals();

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockDeals });
    });
  });

  describe("getDealsByClient", () => {
    it("should fetch deals for a client", async () => {
      const mockDeals = [{ id: "1", title: "Deal 1" }];
      const clientId = "client-1";
      (db.select().from(deals).where(eq(deals.clientId, clientId)).orderBy as jest.Mock).mockResolvedValue(mockDeals);

      const result = await getDealsByClient(clientId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockDeals });
    });
  });

  describe("getDeal", () => {
    it("should fetch a deal by id", async () => {
      const mockDeal = { id: "1", title: "Deal 1" };
      (db.query.deals.findFirst as jest.Mock).mockResolvedValue(mockDeal);

      const result = await getDeal("1");

      expect(db.query.deals.findFirst).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockDeal });
    });

    it("should return error if deal not found", async () => {
      (db.query.deals.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getDeal("1");

      expect(result).toEqual({ success: false, error: "Deal not found" });
    });
  });

  describe("createDeal", () => {
    it("should create a deal successfully", async () => {
      const validClientId = "123e4567-e89b-12d3-a456-426614174000";
      const input = { title: "New Deal", clientId: validClientId };
      const mockClient = { id: validClientId, name: "Client 1" };
      const mockCreatedDeal = { id: "1", title: "New Deal", clientId: validClientId };

      // Mock client existence check
      (db.query.clients.findFirst as jest.Mock).mockResolvedValue(mockClient);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db.insert(deals).values(expect.any(Object) as any).returning as jest.Mock).mockResolvedValue([mockCreatedDeal]);

      const result = await createDeal(input);

      expect(db.query.clients.findFirst).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalledWith(deals);
      expect(result).toEqual({ success: true, data: mockCreatedDeal });
    });

    it("should fail if client does not exist", async () => {
        const validClientId = "123e4567-e89b-12d3-a456-426614174000";
        const input = { title: "New Deal", clientId: validClientId };
        
        // Mock client not found
        (db.query.clients.findFirst as jest.Mock).mockResolvedValue(null);
  
        const result = await createDeal(input);
  
        expect(result).toEqual({ success: false, error: "Client not found" });
    });
  });

  describe("updateDeal", () => {
    it("should update a deal successfully", async () => {
        const validId = "123e4567-e89b-12d3-a456-426614174000";
        const input = { id: validId, title: "Updated Deal" };
        const mockUpdatedDeal = { id: validId, title: "Updated Deal" };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (db.update(deals).set(expect.any(Object) as any).where(eq(deals.id, validId)).returning as jest.Mock).mockResolvedValue([mockUpdatedDeal]);

        const result = await updateDeal(input);

        expect(db.update).toHaveBeenCalledWith(deals);
        expect(result).toEqual({ success: true, data: mockUpdatedDeal });
    });
  });

  describe("deleteDeal", () => {
    it("should delete a deal successfully", async () => {
        const validId = "123e4567-e89b-12d3-a456-426614174000";
        // Mock returning deal with clientId for revalidation logic
        (db.delete(deals).where(eq(deals.id, validId)).returning as jest.Mock).mockResolvedValue([{ clientId: "client-id" }]);

        const result = await deleteDeal(validId);

        expect(db.delete).toHaveBeenCalledWith(deals);
        expect(result).toEqual({ success: true });
    });
  });

  // --- Activities ---
  describe("getActivitiesByClient", () => {
    it("should fetch activities for a client", async () => {
      const mockActivities = [{ id: "1", type: "call" }];
      const clientId = "client-1";
      (db.select().from(activities).where(eq(activities.clientId, clientId)).orderBy as jest.Mock).mockResolvedValue(mockActivities);

      const result = await getActivitiesByClient(clientId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockActivities });
    });
  });

  describe("getActivitiesByDeal", () => {
    it("should fetch activities for a deal", async () => {
      const mockActivities = [{ id: "1", type: "call" }];
      const dealId = "deal-1";
      (db.select().from(activities).where(eq(activities.dealId, dealId)).orderBy as jest.Mock).mockResolvedValue(mockActivities);

      const result = await getActivitiesByDeal(dealId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockActivities });
    });
  });

  describe("createActivity", () => {
    it("should create an activity successfully", async () => {
        const validClientId = "123e4567-e89b-12d3-a456-426614174000";
        const input = { type: "call" as const, content: "Call notes", clientId: validClientId };
        const mockClient = { id: validClientId, name: "Client 1" };
        const mockCreatedActivity = { id: "1", type: "call", content: "Call notes", clientId: validClientId };

        // Mock client check
        (db.query.clients.findFirst as jest.Mock).mockResolvedValue(mockClient);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (db.insert(activities).values(expect.any(Object) as any).returning as jest.Mock).mockResolvedValue([mockCreatedActivity]);

        const result = await createActivity(input);

        expect(db.insert).toHaveBeenCalledWith(activities);
        expect(result).toEqual({ success: true, data: mockCreatedActivity });
    });
  });

  describe("deleteActivity", () => {
    it("should delete an activity successfully", async () => {
        const validId = "123e4567-e89b-12d3-a456-426614174000";
        // Mock returning activity with clientId for revalidation logic
        (db.delete(activities).where(eq(activities.id, validId)).returning as jest.Mock).mockResolvedValue([{ clientId: "client-id" }]);

        const result = await deleteActivity(validId);

        expect(db.delete).toHaveBeenCalledWith(activities);
        expect(result).toEqual({ success: true });
    });
  });
});
