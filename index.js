#!/usr/bin/env node

const { Command } = require("commander");
const inquirer = require("inquirer");
const fs = require("fs");

const program = new Command();

program
  .name("create-tanstack-start")
  .description(
    "CLI to create a React app with Vite, TanStack Router, and TanStack Query"
  )
  .version("1.0.20");

program.parse(process.argv);

(async () => {
  // Dynamically import execa
  const { execa } = await import("execa");

  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter your project name:",
      default: "my-vite-app",
    },
  ]);

  const { useTypescript } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useTypescript",
      message: "Would you like to use TypeScript?",
      default: true,
    },
  ]);

  // Create project with Vite
  console.log(`\nCreating Vite project...`);
  const template = useTypescript ? "react-ts" : "react";
  await execa("npm", [
    "create",
    "vite@latest",
    projectName,
    "--",
    "--template",
    template,
  ]);

  // Navigate into project directory
  process.chdir(projectName);

  // Install dependencies
  console.log(`\nInstalling dependencies...`);
  await execa("npm", ["install"]);
  await execa("npm", [
    "install",
    "@tanstack/react-router@latest",
    "@tanstack/react-query@latest",
    "react-router-dom@latest",
  ]);

  // Add TanStack Router and Query setup
  console.log(`\nSetting up TanStack Query and React Router Dom...`);

  const appJsPath = useTypescript ? "src/App.tsx" : "src/App.jsx";

  const appJsContent = `
import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;

  `;

  const routerJsContent = `
import { createBrowserRouter } from "react-router-dom";
import Home from "./Home";
// Define your routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

export default router;

  `;

  const homeJsContent = `
import React from 'react';

function Home() {
  return <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent:'center',
    alignItems:'center'
  }}>
    <h1>Welcome to react router dom and Query!</h1>
  </div>;
}

export default Home;
  `;

  fs.writeFileSync(appJsPath, appJsContent);
  fs.writeFileSync("src/router.tsx", routerJsContent);
  fs.writeFileSync("src/Home.tsx", homeJsContent);

  console.log(`\nSetup complete!`);
  console.log(`\nRun the following commands to start your app:`);
  console.log(`\ncd ${projectName}`);
  console.log(`npm run dev`);
})();
