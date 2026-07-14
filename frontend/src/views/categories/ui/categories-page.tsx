import { CreateCategoryDialog } from "@/features/categories/create";
import { CategoriesList } from "@/features/categories/list";

export function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Категории</h1>
          <p className="text-sm text-muted-foreground">Управление категориями расходов и доходов</p>
        </div>
        <CreateCategoryDialog />
      </div>

      <CategoriesList />
    </div>
  );
}
