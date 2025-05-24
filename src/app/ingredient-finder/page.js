"use client";

import React, { useState } from "react";
import IngredientFinderForm from "../components/IngredientFinderForm/IngredientFinderForm";

function page() {
  return (
    <div>
      <h1>Ingredient Finder</h1>
      <IngredientFinderForm />
      {/* Initial response: Ingredient display */}
      <div></div>
    </div>
  );
}

export default page;
