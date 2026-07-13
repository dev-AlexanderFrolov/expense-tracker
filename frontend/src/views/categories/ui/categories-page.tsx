"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryKeys, getCategories } from "@/entities/category";
import { CreateCategoryDialog } from "@/features/categories/create";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { ApiError } from "@/shared/api/client";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function CategoriesPage() {
  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Категории</h1>
          <p className="text-sm text-muted-foreground">Управление категориями расходов и доходов</p>
        </div>
        <CreateCategoryDialog />
      </div>

      {isLoading && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Не удалось загрузить категории</AlertTitle>
          <AlertDescription>
            {error instanceof ApiError ? error.message : "Попробуйте обновить страницу"}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && (categories?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-16 text-center">
            <p className="text-sm font-medium">Пока нет категорий</p>
            <p className="text-sm text-muted-foreground">
              Добавьте первую категорию, чтобы начать учитывать транзакции
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (categories?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories!.map((category) => (
            <Badge key={category.id} variant="secondary" className="px-3 py-1 text-sm">
              {category.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
