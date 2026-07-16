"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import Link from "next/link";
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
import type { Customer } from "@/lib/types";
import { listCustomers } from "@/lib/repo/customers";

export function CustomerCombobox({
  value,
  onSelect,
}: {
  value: Customer | null;
  onSelect: (customer: Customer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const handle = setTimeout(async () => {
      setResults(await listCustomers(query));
      setLoading(false);
    }, 150);
    return () => clearTimeout(handle);
  }, [query, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-between font-normal h-auto py-2"
        )}
      >
        {value ? (
          <span className="flex flex-col items-start text-left">
            <span className="font-medium">{value.name}</span>
            {value.companyName && (
              <span className="text-xs text-muted-foreground">
                {value.companyName}
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Search customer by name, mobile, GSTIN...
          </span>
        )}
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search customers..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : "No customers found."}
            </CommandEmpty>
            <CommandGroup>
              {results.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={() => {
                    onSelect(c);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value?.id === c.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[c.mobile, c.city].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="border-t p-1">
            <Link
              href="/customers/new"
              target="_blank"
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <UserPlus className="size-4" />
              New customer
            </Link>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
