import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
};

export function DataTable<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
