"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"
import { enUS, es, fr } from "react-day-picker/locale" // <-- added French
import { Pie, PieChart, Sector, Label } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/Components/ui/chart"
import { Calendar } from "@/Components/ui/calendar"

// -------------------------
// Pie Chart Data & Config
// -------------------------
const desktopData = [
  { month: "january", desktop: 186, fill: "#3b82f6" },
  { month: "february", desktop: 305, fill: "#ef4444" },
  { month: "march", desktop: 237, fill: "#f59e0b" },
  { month: "april", desktop: 173, fill: "#10b981" },
  { month: "may", desktop: 209, fill: "#8b5cf6" },
]

const chartConfig = {
  visitors: { label: "Visitors", color: "#9ca3af" },
  desktop: { label: "Desktop", color: "#3b82f6" },
  mobile: { label: "Mobile", color: "#f97316" },
  january: { label: "January", color: "#3b82f6" },
  february: { label: "February", color: "#ef4444" },
  march: { label: "March", color: "#f59e0b" },
  april: { label: "April", color: "#10b981" },
  may: { label: "May", color: "#8b5cf6" },
} satisfies ChartConfig

// -------------------------
// Calendar Localization
// -------------------------
const localizedStrings = {
  en: { title: "Date", description: "" },
  es: { title: "Fechas", description: "" },
  fr: { title: "Dates", description: "" },
} as const

// -------------------------
// DashboardWidgets Component
// -------------------------
export function DashboardWidgets() {
  const id = "pie-interactive"

  // Pie chart state
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month)
  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.month === activeMonth),
    [activeMonth]
  )
  const months = React.useMemo(() => desktopData.map((item) => item.month), [])

  // Calendar state
  const [locale, setLocale] = React.useState<keyof typeof localizedStrings>("es")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2025, 8, 9),
    to: new Date(2025, 8, 17),
  })

  return (
    <div className="grid gap-4 px-4 lg:px-6 sm:grid-cols-1 md:grid-cols-2">
      {/* -------- Pie Chart Card -------- */}
      <Card data-chart={id} className="flex flex-col">
        <ChartStyle id={id} config={chartConfig} />
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Pie Chart - Interactive</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </div>
          <Select value={activeMonth} onValueChange={setActiveMonth}>
            <SelectTrigger className="ml-auto h-7 w-[130px] rounded-lg pl-2.5" aria-label="Select a value">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {months.map((key) => {
                const config = chartConfig[key as keyof typeof chartConfig]
                if (!config) return null
                const color = "color" in config ? config.color : "#888888" // fallback gray
                return (
                  <SelectItem key={key} value={key} className="rounded-lg [&_span]:flex">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex h-3 w-3 shrink-0 rounded-xs" style={{ backgroundColor: color }} />
                      {config.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={desktopData}
                dataKey="desktop"
                nameKey="month"
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex}
                activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {desktopData[activeIndex].desktop.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                            Visitors
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* -------- Calendar Card -------- */}
      <Card>
        <CardHeader className="border-b flex items-center gap-2">
          <div className="flex-1">
            <CardTitle>{localizedStrings[locale].title}</CardTitle>
            <CardDescription>{localizedStrings[locale].description}</CardDescription>
          </div>
          <div>
            <Select value={locale} onValueChange={(value) => setLocale(value as keyof typeof localizedStrings)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem> {/* Added French */}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            defaultMonth={dateRange?.from}
            numberOfMonths={2}
            locale={locale === "es" ? es : locale === "fr" ? fr : enUS} // map French locale
            className="bg-transparent p-0"
            buttonVariant="outline"
          />
        </CardContent>
      </Card>
    </div>
  )
}
