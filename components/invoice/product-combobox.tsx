"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Product } from "@/lib/types";
import { listProducts } from "@/lib/repo/products";

export function ProductCombobox({
  onSelect,
}: {
  onSelect: (product: Product) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      setResults(await listProducts(query));
    }, 150);
    return () => clearTimeout(handle);
  }, [query, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-between font-normal"
        )}
      >
        <span className="text-muted-foreground truncate">
          Search product...
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {results.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.id}
                  onSelect={() => {
                    onSelect(p);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.hsn ? `HSN ${p.hsn} · ` : ""}₹{p.sellingPrice} ·{" "}
                      {p.gstPercent}% GST
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
