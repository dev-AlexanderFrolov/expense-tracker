import { baseConfig } from "@expense-tracker/eslint-config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

export default [...baseConfig, ...compat.extends("next/core-web-vitals")];
