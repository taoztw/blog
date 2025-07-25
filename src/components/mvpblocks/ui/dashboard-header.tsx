"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { Bell, Download, Filter, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import { memo } from "react";

export const DashboardHeader = memo(() => {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-2 px-4">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          {/* Search Input - Hide on Mobile */}
          {/* <div className="relative hidden md:block">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-10"
            />
          </div> */}

          {/* Desktop Actions */}
          {/* <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>

            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div> */}

          {/* Mobile Menu */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onSearchChange("")}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";
