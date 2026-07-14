import { baseConfig } from "@expense-tracker/eslint-config";
import nextPlugin from "@next/eslint-plugin-next";

const publicApiRestriction = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["@/features/*/*", "@/features/*/**"],
          message: "Импортируйте из публичного API слайса (@/features/<slice>).",
        },
        {
          group: ["@/entities/*/*", "@/entities/*/**"],
          message: "Импортируйте из публичного API сущности (@/entities/<entity>).",
        },
        {
          group: ["@/views/*/*", "@/views/*/**"],
          message: "Импортируйте из публичного API view (@/views/<slice>).",
        },
        {
          group: ["@/widgets/*/*", "@/widgets/*/**"],
          message: "Импортируйте из публичного API виджета (@/widgets/<slice>).",
        },
      ],
    },
  ],
};

export default [
  ...baseConfig,
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: publicApiRestriction,
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/entities/*", "@/features/*", "@/widgets/*", "@/views/*", "@/app/*"],
              message: "Слой shared не может импортировать верхние FSD-слои.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/widgets/*", "@/views/*", "@/app/*"],
              message: "Слой entities не может импортировать features, widgets, views и app.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/widgets/*", "@/views/*", "@/app/*"],
              message: "Слой features не может импортировать widgets, views и app.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/views/*", "@/app/*"],
              message: "Слой widgets не может импортировать views и app.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/views/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*"],
              message: "Слой views не может импортировать app.",
            },
          ],
        },
      ],
    },
  },
];
