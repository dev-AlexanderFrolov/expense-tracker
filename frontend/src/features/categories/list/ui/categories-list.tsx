"use client";

import { useCategoriesList } from "../model/use-categories";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { ApiError } from "@/shared/api/client";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function CategoriesList() {
  const { data: categories, isLoading, isError, error } = useCategoriesList();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Не удалось загрузить категории</AlertTitle>
        <AlertDescription>
          {error instanceof ApiError ? error.message : "Попробуйте обновить страницу"}
        </AlertDescription>
      </Alert>
    );
  }

  if ((categories?.length ?? 0) === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-1 py-16 text-center">
          <p className="text-sm font-medium">Пока нет категорий</p>
          <p className="text-sm text-muted-foreground">
            Добавьте первую категорию, чтобы начать учитывать транзакции
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories!.map((category) => (
        <Badge key={category.id} variant="secondary" className="px-3 py-1 text-sm">
          {category.name}
        </Badge>
      ))}
    </div>
  );
}
