import { Search } from "lucide-react";

import { eventCategories } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export function EventFilters() {
  return (
    <Card className="border border-black/5 bg-white/90">
      <CardContent className="grid gap-4 pt-6 lg:grid-cols-[1.8fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by event title, organizer, or topic"
            className="h-11 border-black/10 pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="h-11 border-black/10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {eventCategories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="all-cities">
          <SelectTrigger className="h-11 border-black/10">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-cities">All cities</SelectItem>
            <SelectItem value="singapore">Singapore</SelectItem>
            <SelectItem value="jakarta">Jakarta</SelectItem>
            <SelectItem value="bandung">Bandung</SelectItem>
            <SelectItem value="kuala-lumpur">Kuala Lumpur</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="date">
          <SelectTrigger className="h-11 border-black/10">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by date</SelectItem>
            <SelectItem value="price">Sort by price</SelectItem>
            <SelectItem value="popularity">Sort by popularity</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
