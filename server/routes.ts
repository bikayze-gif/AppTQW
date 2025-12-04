import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBillingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Billing API routes
  
  // GET all billing records
  app.get("/api/billing", async (req, res) => {
    try {
      const billing = await storage.getAllBilling();
      res.json(billing);
    } catch (error) {
      console.error("Error fetching billing:", error);
      res.status(500).json({ error: "Failed to fetch billing records" });
    }
  });

  // GET single billing record
  app.get("/api/billing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const billing = await storage.getBillingById(id);
      if (!billing) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.json(billing);
    } catch (error) {
      console.error("Error fetching billing record:", error);
      res.status(500).json({ error: "Failed to fetch billing record" });
    }
  });

  // POST create new billing record
  app.post("/api/billing", async (req, res) => {
    try {
      // Parse and validate the incoming data
      const validatedData = insertBillingSchema.parse(req.body);
      
      // Ensure fecha_gestion is in correct format (YYYY-MM-DD) or null
      const dataToInsert = {
        ...validatedData,
        fecha_gestion: validatedData.fecha_gestion 
          ? validatedData.fecha_gestion.split('T')[0] 
          : null,
      };
      
      const billing = await storage.createBilling(dataToInsert);
      res.status(201).json(billing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid billing data", details: error.errors });
      }
      console.error("Error creating billing:", error);
      res.status(500).json({ error: "Failed to create billing record" });
    }
  });

  // PATCH update billing record
  app.patch("/api/billing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBillingSchema.partial().parse(req.body);
      
      // Ensure fecha_gestion is in correct format (YYYY-MM-DD) or null
      const dataToUpdate = {
        ...validatedData,
        fecha_gestion: validatedData.fecha_gestion 
          ? validatedData.fecha_gestion.split('T')[0] 
          : validatedData.fecha_gestion === null 
          ? null 
          : undefined,
      };
      
      const billing = await storage.updateBilling(id, dataToUpdate);
      if (!billing) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.json(billing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid billing data", details: error.errors });
      }
      console.error("Error updating billing:", error);
      res.status(500).json({ error: "Failed to update billing record" });
    }
  });

  // DELETE billing record
  app.delete("/api/billing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBilling(id);
      if (!deleted) {
        return res.status(404).json({ error: "Billing record not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting billing:", error);
      res.status(500).json({ error: "Failed to delete billing record" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
