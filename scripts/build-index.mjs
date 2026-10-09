#!/usr/bin/env node
// 扫描 recipes/*/recipe.json，自动生成根目录 recipes-index.js（首页搜索/分页的数据源）。
// 用法（仓库根目录执行）：node scripts/build-index.mjs
// Cloudflare Pages 构建配置：Build command = node scripts/build-index.mjs，输出目录 = /
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const recipesDir = join(root, "recipes");

const recipes = readdirSync(recipesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"))
  .map(name => {
    const data = JSON.parse(readFileSync(join(recipesDir, name, "recipe.json"), "utf8"));
    const ingredients = [];
    for (const step of data.steps || []) {
      for (const ing of step.ingredients || []) {
        if (!ingredients.includes(ing)) ingredients.push(ing);
      }
    }
    return {
      path: `recipes/${name}/`,
      title: data.title || name,
      subtitle: data.subtitle || "",
      ingredients
    };
  });

const out = "// 本文件由 scripts/build-index.mjs 自动生成，请勿手工编辑\n" +
  "const RECIPES = " + JSON.stringify(recipes, null, 2) + ";\n";
writeFileSync(join(root, "recipes-index.js"), out);
console.log("recipes-index.js 已生成：" + recipes.length + " 道菜");
