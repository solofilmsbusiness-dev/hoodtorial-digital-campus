import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export type SubscriptionFilter = "all" | "trial" | "active" | "expired";
export type TierFilter = "all" | "freshman" | "sophomore" | "graduate";
export type RoleFilter = "all" | "admin" | "professor" | "moderator" | "student";
export type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "quiz-rate" | "courses";

interface StudentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  subscriptionFilter: SubscriptionFilter;
  onSubscriptionChange: (value: SubscriptionFilter) => void;
  tierFilter: TierFilter;
  onTierChange: (value: TierFilter) => void;
  roleFilter: RoleFilter;
  onRoleChange: (value: RoleFilter) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function StudentFilters({
  searchQuery,
  onSearchChange,
  subscriptionFilter,
  onSubscriptionChange,
  tierFilter,
  onTierChange,
  roleFilter,
  onRoleChange,
  sortOption,
  onSortChange,
}: StudentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={subscriptionFilter} onValueChange={onSubscriptionChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="trial">Trial</SelectItem>
          <SelectItem value="active">Paid</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>

      <Select value={tierFilter} onValueChange={onTierChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value="freshman">Freshman</SelectItem>
          <SelectItem value="sophomore">Sophomore</SelectItem>
          <SelectItem value="graduate">Graduate</SelectItem>
        </SelectContent>
      </Select>

      <Select value={roleFilter} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="professor">Professor</SelectItem>
          <SelectItem value="moderator">Moderator</SelectItem>
          <SelectItem value="student">Student</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortOption} onValueChange={onSortChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="quiz-rate">Quiz Pass Rate</SelectItem>
          <SelectItem value="courses">Most Courses</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
