import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { TrendingUp, TrendingDown, Settings, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";

const chartData = [
  { time: "12:00", value: 6550 },
  { time: "13:00", value: 6560 },
  { time: "14:00", value: 6570 },
  { time: "15:00", value: 6580 },
  { time: "16:00", value: 6590 },
  { time: "17:00", value: 6600 },
  { time: "18:00", value: 6590 },
  { time: "19:00", value: 6610 },
  { time: "20:00", value: 6630 },
  { time: "21:00", value: 6640 },
  { time: "22:00", value: 6650 },
];

const cryptoData = [
  {
    id: "eth",
    name: "Ethereum (ETH)",
    price: "$170.46",
    change: 2.35,
    spark: [100, 120, 110, 130, 125, 140, 135, 145, 150],
  },
  {
    id: "bch",
    name: "Bitcoin Cash (BCH)",
    price: "$359.93",
    change: 9.64,
    spark: [100, 110, 105, 115, 120, 125, 130, 140, 145],
  },
  {
    id: "xrp",
    name: "XRP (XRP)",
    price: "$0.24",
    change: -8.35,
    spark: [100, 95, 90, 85, 80, 85, 90, 85, 80],
  },
  {
    id: "ltc",
    name: "Litecoin (LTC)",
    price: "$60.15",
    change: 8.99,
    spark: [100, 108, 115, 120, 125, 130, 135, 140, 145],
  },
  {
    id: "zec",
    name: "Zcash (ZEC)",
    price: "$58.41",
    change: -8.79,
    spark: [100, 95, 90, 85, 80, 85, 88, 85, 82],
  },
  {
    id: "btg",
    name: "Bitcoin Gold (BTG)",
    price: "$12.23",
    change: -4.43,
    spark: [100, 98, 95, 92, 90, 88, 85, 82, 78],
  },
];

export default function SupervisorMonitoring() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <span>Home</span>
          <span>/</span>
          <span>Dashboards</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Crypto</span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Crypto List */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
              {cryptoData.map((crypto) => (
                <div
                  key={crypto.id}
                  className="pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded transition-colors"
                  data-testid={`crypto-item-${crypto.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{crypto.name.split(" ")[0]}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{crypto.price}</p>
                    </div>
                    <div className={`text-xs font-semibold flex items-center gap-1 ${crypto.change > 0
                      ? "text-green-600"
                      : "text-red-600"
                      }`}>
                      {crypto.change > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(crypto.change).toFixed(2)}%
                    </div>
                  </div>
                  <div className="h-8 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={crypto.spark.map((v, i) => ({ v }))}>
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={crypto.change > 0 ? "#10b981" : "#ef4444"}
                          dot={false}
                          strokeWidth={1.5}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Action *</label>
                <Select defaultValue="buy">
                  <SelectTrigger className="mt-1 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="buy" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700">Buy</SelectItem>
                    <SelectItem value="sell" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Wallet *</label>
                <Select defaultValue="bitcoin">
                  <SelectTrigger className="mt-1 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="bitcoin" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700">Bitcoin - 24.9731243 BTC</SelectItem>
                    <SelectItem value="ethereum" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700">Ethereum - 100 ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Center - Main Chart */}
          <div className="col-span-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bitcoin (BTC)</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">$8,878.48</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      $0.17%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400"
                    data-testid="btn-settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400"
                    data-testid="btn-download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <XAxis dataKey="time" stroke={isDark ? "#94a3b8" : "#94a3b8"} />
                    <YAxis stroke={isDark ? "#94a3b8" : "#94a3b8"} domain={[6550, 6660]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                        border: isDark ? "1px solid #475569" : "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: isDark ? "#fff" : "#0f172a"
                      }}
                      itemStyle={{
                        color: isDark ? "#fff" : "#0f172a"
                      }}
                      labelStyle={{ color: isDark ? "#94a3b8" : "#64748b" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Market Stats */}
          <div className="col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Market Cap</h3>
              <div className="grid grid-cols-2 gap-4">
                <div data-testid="stat-market-cap">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Market Cap</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">$148.75B</p>
                </div>
                <div data-testid="stat-volume">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Volume</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">$22.90B</p>
                </div>
                <div data-testid="stat-supply">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Supply</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">$18.17M</p>
                </div>
                <div data-testid="stat-high">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">All Time High</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">$0.00B</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="fixed right-6 bottom-20 space-y-3">
              <Button
                className="w-12 h-12 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center"
                data-testid="btn-action-1"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                className="w-12 h-12 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center"
                data-testid="btn-action-2"
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
