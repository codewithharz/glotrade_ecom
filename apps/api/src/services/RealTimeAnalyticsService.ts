// // src/services/RealTimeAnalyticsService.ts
// import { EventEmitter } from "events";
// import { WebSocket } from "ws";
// import { NotificationService } from "./NotificationService";

// interface MetricUpdate {
//   metric: string;
//   value: number;
//   timestamp: Date;
//   metadata?: Record<string, any>;
// }

// interface Alert {
//   type: "info" | "warning" | "error";
//   message: string;
//   timestamp: Date;
//   metadata?: Record<string, any>;
// }

// export class RealTimeAnalyticsService extends EventEmitter {
//   private metrics: Map<string, any[]> = new Map();
//   private alerts: Alert[] = [];
//   private connections: Set<WebSocket> = new Set();
//   private updateInterval: NodeJS.Timer | null = null;

//   constructor(private notificationService: NotificationService) {
//     super();
//     this.initializeMetrics();
//     this.startPeriodicUpdates();
//   }

//   // Initialize WebSocket connection for a client
//   public addClient(ws: WebSocket): void {
//     this.connections.add(ws);
//     ws.on("close", () => this.connections.delete(ws));

//     // Send initial state
//     this.sendInitialState(ws);
//   }

//   // Update metric with new value
//   public updateMetric(update: MetricUpdate): void {
//     const { metric, value, timestamp, metadata } = update;

//     if (!this.metrics.has(metric)) {
//       this.metrics.set(metric, []);
//     }

//     const metricData = this.metrics.get(metric);
//     metricData?.push({ value, timestamp, metadata });

//     // Keep only last 1000 data points
//     if (metricData && metricData.length > 1000) {
//       metricData.shift();
//     }

//     // Check for alerts
//     this.checkAlerts(metric, value, metadata);

//     // Broadcast update
//     this.broadcastUpdate({
//       type: "metric_update",
//       data: { metric, value, timestamp, metadata },
//     });
//   }

//   // Add alert
//   public addAlert(alert: Alert): void {
//     this.alerts.push(alert);

//     // Keep only last 100 alerts
//     if (this.alerts.length > 100) {
//       this.alerts.shift();
//     }

//     // Broadcast alert
//     this.broadcastUpdate({
//       type: "alert",
//       data: alert,
//     });

//     // Send notification if necessary
//     if (alert.type === "error") {
//       this.notificationService.sendNotification("system_alert", {
//         type: "system",
//         data: alert,
//       });
//     }
//   }

//   // Get metric history
//   public getMetricHistory(
//     metric: string,
//     duration: number = 3600000 // 1 hour in milliseconds
//   ): any[] {
//     const now = Date.now();
//     const metricData = this.metrics.get(metric) || [];

//     return metricData.filter(
//       (data) => now - data.timestamp.getTime() <= duration
//     );
//   }

//   private initializeMetrics(): void {
//     // Initialize basic metrics
//     const initialMetrics = [
//       "active_users",
//       "orders_per_minute",
//       "revenue_per_minute",
//       "error_rate",
//     ];

//     initialMetrics.forEach((metric) => {
//       this.metrics.set(metric, []);
//     });
//   }

//   private startPeriodicUpdates(): void {
//     this.updateInterval = setInterval(() => {
//       this.calculateAndUpdateMetrics();
//     }, 60000); // Update every minute
//   }

//   private calculateAndUpdateMetrics(): void {
//     // Calculate active users
//     this.updateMetric({
//       metric: "active_users",
//       value: this.connections.size,
//       timestamp: new Date(),
//     });

//     // Other periodic calculations...
//   }

//   private checkAlerts(
//     metric: string,
//     value: number,
//     metadata?: Record<string, any>
//   ): void {
//     // Define thresholds
//     const thresholds: Record<string, { warning: number; error: number }> = {
//       error_rate: { warning: 0.05, error: 0.1 },
//       orders_per_minute: { warning: 100, error: 200 },
//     };

//     const threshold = thresholds[metric];
//     if (threshold) {
//       if (value >= threshold.error) {
//         this.addAlert({
//           type: "error",
//           message: `${metric} exceeded error threshold: ${value}`,
//           timestamp: new Date(),
//           metadata,
//         });
//       } else if (value >= threshold.warning) {
//         this.addAlert({
//           type: "warning",
//           message: `${metric} exceeded warning threshold: ${value}`,
//           timestamp: new Date(),
//           metadata,
//         });
//       }
//     }
//   }

//   private sendInitialState(ws: WebSocket): void {
//     const initialState = {
//       type: "initial_state",
//       data: {
//         metrics: Object.fromEntries(this.metrics),
//         alerts: this.alerts.slice(-10), // Send last 10 alerts
//       },
//     };

//     ws.send(JSON.stringify(initialState));
//   }

//   private broadcastUpdate(update: any): void {
//     const message = JSON.stringify(update);
//     this.connections.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   }

//   public cleanup(): void {
//     if (this.updateInterval) {
//       clearInterval(this.updateInterval);
//     }
//     this.connections.forEach((client) => client.close());
//     this.connections.clear();
//   }
// }
