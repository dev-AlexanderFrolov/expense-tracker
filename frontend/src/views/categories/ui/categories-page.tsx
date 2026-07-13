import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Категории</h1>
        <p className="text-sm text-muted-foreground">Управление категориями расходов и доходов</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Скоро здесь появится список категорий</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Раздел находится в разработке.
        </CardContent>
      </Card>
    </div>
  );
}
