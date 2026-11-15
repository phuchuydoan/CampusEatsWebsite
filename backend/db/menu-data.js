// The Campus Eats menu, transcribed from the eight menu boards (pic1–pic8 in
// the repo root). Prices are in dollars here for readability; the seed script
// converts them to cents.
//
// An item is priced in exactly one of three ways:
//   price:    one fixed price
//   variants: its own list of priced choices
//   (neither) the category's `sizes` (Roll / Wrap / Hero / Panini) + `surcharge`

const SIGNATURE_SIZES = [
  { name: 'Roll', price: 9.99 },
  { name: 'Wrap', price: 10.99 },
  { name: 'Hero', price: 11.99 },
  { name: 'Panini', price: 12.99 },
];

// The vegetarian/vegan board prices the Hero at $12.99, not $11.99.
const VEGGIE_SIZES = [
  { name: 'Roll', price: 9.99 },
  { name: 'Wrap', price: 10.99 },
  { name: 'Hero', price: 12.99 },
  { name: 'Panini', price: 12.99 },
];

const PLAIN_OR_LOADED = [
  { name: 'Plain', price: 6.99 },
  { name: 'With Meat', price: 8.99 },
  { name: 'With Eggs', price: 9.99 },
  { name: 'With Eggs, Meat & Cheese', price: 10.99 },
];

export const categories = [
  {
    slug: 'breakfast',
    name: 'Breakfast',
    blurb: 'Eggs, bagels and platters.',
    image: '/images/breakfast.jpg',
    addons: [
      { name: 'Extra Egg', price: 0.99 },
      { name: 'Egg Whites', price: 1.99 },
      { name: 'Home Fries or Potato Tots', price: 2.0 },
      { name: 'Bacon', price: 2.0 },
      { name: 'Turkey Bacon', price: 2.0 },
      { name: 'Sausage', price: 2.0 },
      { name: 'Smoked Salmon', price: 5.0 },
      { name: 'Cheese', price: 1.0 },
      { name: 'Fresh Mozzarella', price: 2.0 },
      { name: 'Spinach', price: 1.0 },
      { name: 'Lettuce or Tomato', price: 0.5 },
      { name: 'Jalapeños', price: 1.0 },
      { name: 'Onions', price: 0.5 },
      { name: 'Avocado', price: 2.0 },
    ],
    items: [
      {
        name: 'Eggs on a Roll or Bagel',
        variants: [
          { name: 'On a Roll', price: 3.99 },
          { name: 'On a Bagel', price: 3.99 },
          { name: 'On a Roll with Meat', price: 6.99 },
          { name: 'On a Bagel with Meat', price: 6.99 },
        ],
      },
      {
        name: 'Eggs & Cheese on a Roll or Bagel',
        variants: [
          { name: 'On a Roll', price: 4.99 },
          { name: 'On a Bagel', price: 4.99 },
          { name: 'On a Roll with Meat', price: 7.99 },
          { name: 'On a Bagel with Meat', price: 7.99 },
        ],
      },
      {
        name: 'Platter',
        description: '3 Eggs, Home Fries & Toast',
        variants: [
          { name: 'Classic', price: 6.99 },
          { name: 'With Cheese', price: 8.99 },
          { name: 'With Meat', price: 9.99 },
          { name: 'With Meat & Cheese', price: 10.99 },
        ],
      },
      { name: 'Breakfast Meat Only', price: 4.99 },
      {
        name: 'Muffin',
        variants: [
          { name: 'Raisin Bran', price: 3.99 },
          { name: 'Banana Nut', price: 3.99 },
          { name: 'Corn', price: 3.99 },
          { name: 'Chocolate Chip', price: 3.99 },
          { name: 'Double Chocolate', price: 3.99 },
          { name: 'Blueberry', price: 3.99 },
        ],
      },
      {
        name: 'Bagel',
        variants: [
          { name: 'Plain', price: 1.25 },
          { name: 'With Butter', price: 2.5 },
          { name: 'With Cream Cheese', price: 3.49 },
          { name: 'With Flavored Cream Cheese', price: 4.49 },
          { name: 'With Cream Cheese & Bacon', price: 6.99 },
          { name: 'With Tuna', price: 8.99 },
        ],
      },
      { name: 'Half Dozen Bagels', description: 'Includes 1 free', price: 7.5 },
      { name: 'Dozen Bagels', description: 'Includes 3 free', price: 15.0 },
    ],
  },
  {
    slug: 'breakfast-favorites',
    name: 'Breakfast Favorites',
    blurb: 'Pancakes, French toast and the Hungry Man.',
    image: '/images/breakfast-favorites.jpg',
    items: [
      { name: 'Grilled Cheese', price: 4.99 },
      { name: 'Pancakes (3)', variants: PLAIN_OR_LOADED },
      {
        name: 'Hungry Man',
        description: '3 Pancakes, 2 Eggs, Bacon, Sausage, Ham & Home Fries',
        price: 13.99,
        featured: true,
      },
      {
        name: 'Flavored Pancakes (3)',
        variants: [
          { name: 'Blueberry', price: 9.99 },
          { name: 'Chocolate Chip', price: 9.99 },
          { name: 'Strawberry Banana', price: 10.99 },
          { name: 'S’mores', price: 10.99 },
          { name: 'Mixed Berry', price: 10.99 },
        ],
      },
      { name: 'French Toast (3)', variants: PLAIN_OR_LOADED },
      {
        name: 'Stuffed French Toast',
        variants: [
          { name: 'Nutella, Strawberry & Banana', price: 9.99 },
          { name: 'Strawberry Cream Cheese', price: 10.99 },
        ],
      },
    ],
  },
  {
    slug: 'breakfast-burritos',
    name: 'Breakfast Burritos',
    blurb: 'Wrapped with tater tots.',
    image: '/images/breakfast-burritos.jpg',
    items: [
      { name: 'Bacon & Cheese Burrito', description: 'Bacon, Cheese & Tater Tots', price: 9.99 },
      { name: 'Sausage & Cheese Burrito', description: 'Sausage, Cheese & Tater Tots', price: 9.99 },
      {
        name: 'Eggs & Veggies Burrito',
        description: 'Eggs, Peppers, Onions, Mushrooms, Spinach & Tater Tots',
        price: 12.99,
      },
      {
        name: 'Healthy Burrito',
        description: 'Salsa, Avocado, Spinach, Egg Whites & Mushrooms',
        price: 13.99,
      },
    ],
  },
  {
    slug: 'tacos',
    name: 'Tacos',
    blurb: 'Three to an order.',
    note: '3 tacos per order, salsa on the side',
    image: '/images/tacos.jpg',
    items: [
      { name: 'Carne Asada Taco', description: '3 tacos, salsa on the side', price: 11.99 },
      { name: 'Pollo Taco', description: '3 tacos, salsa on the side', price: 11.99 },
    ],
  },
  {
    slug: 'omelettes',
    name: 'Omelettes',
    blurb: 'Three eggs, ten ways.',
    note: 'Served with toast',
    image: '/images/omelettes.jpg',
    addons: [{ name: 'Home Fries or Hash Browns', price: 2.0 }],
    items: [
      { name: 'Western', description: '3 Eggs, Ham, Vermont Cheddar Cheese, Peppers & Onions', price: 9.99 },
      { name: 'Bacon & Cheddar', description: '3 Eggs, Bacon & Cheddar Cheese', price: 9.99 },
      { name: 'Swiss', description: '3 Eggs, Swiss Cheese, Mushrooms & Onions', price: 9.99 },
      { name: 'Veggie', description: '3 Eggs, Spinach, Tomato, Peppers & Onions', price: 9.99 },
      { name: 'Philly', description: '3 Eggs, Steak, American Cheese, Peppers & Onions', price: 9.99 },
      { name: 'Italian', description: '3 Eggs, Prosciutto, Parmesan, Tomato & Mushrooms', price: 9.99 },
      {
        name: 'Mexican',
        description: '3 Eggs, Chorizo, Jalapeño Pepper Jack Cheese, Jalapeños, Tomato, Onions & Salsa',
        price: 9.99,
      },
      { name: 'Chorizo', description: '3 Eggs, Chorizo, Jalapeños, Peppers & Onions', price: 9.99 },
      { name: 'Meat Lovers', description: '3 Eggs, Ham, Bacon, Sausage & Cheese', price: 9.99 },
      {
        name: 'Protein',
        description: '3 Egg Whites, Ovengold Turkey, Grilled Chicken, Spinach & Scallions',
        price: 9.99,
      },
    ],
  },
  {
    slug: 'smashburgers',
    name: 'Smashburgers',
    blurb: 'Crispy edges, melted cheese.',
    image: '/images/smashburgers.jpg',
    addons: [
      { name: 'Fries', price: 4.0 },
      { name: 'Extra Patty', price: 2.0 },
      { name: 'Bacon', price: 2.0 },
      { name: 'Extra Cheese', price: 1.0 },
      { name: 'Avocado', price: 2.0 },
      { name: 'Lettuce', price: 0.5 },
      { name: 'Tomatoes', price: 0.5 },
      { name: 'Onions', price: 0.5 },
    ],
    items: [
      {
        name: 'Classic',
        description: 'Beef Patty, American Cheese, Lettuce, Tomato, Onions, Pickles & House Sauce',
        price: 7.99,
      },
      {
        name: 'Bacon',
        description:
          'Two Beef Patties, Bacon, Vermont Cheddar Cheese, Lettuce, Tomato, Onions, Pickles & Smoky BBQ Sauce',
        price: 10.99,
        featured: true,
      },
      {
        name: 'Jalapeño',
        description:
          'Two Beef Patties, Pepper Jack, Jalapeños, Lettuce, Tomato, Onions, Pickles & Fiery Chipotle Gourmaise',
        price: 10.99,
      },
      {
        name: 'Mushroom Swiss',
        description: 'Two Beef Patties, Swiss Cheese, Sautéed Mushrooms, Caramelized Onions & House Sauce',
        price: 9.99,
      },
      {
        name: 'BBQ Bacon',
        description: 'Two Beef Patties, Bacon, Vermont Cheddar Cheese, Onion Rings & BBQ Sauce',
        price: 12.99,
      },
      {
        name: 'Veggie',
        description: 'Grilled Veggie Patty, Lettuce, Tomato, Onions, Pickles & House Sauce',
        price: 9.99,
      },
      {
        name: 'Double Smashburger',
        description: 'Two Beef Patties, Double American Cheese, Lettuce, Tomato, Onions, Pickles & House Sauce',
        price: 10.99,
      },
      {
        name: 'Hamburger',
        description: 'Beef Patty, Lettuce, Tomato, Onions, Pickles & House Sauce',
        price: 6.99,
      },
    ],
  },
  {
    slug: 'signature-cold',
    name: 'Signature Cold Sandwiches',
    blurb: 'C1–C19, on your choice of bread.',
    image: '/images/signature-cold.jpg',
    accent: 'blue',
    sizes: SIGNATURE_SIZES,
    items: [
      { code: 'C1', name: 'Turkey Club Classic', description: 'Ovengold Turkey, Bacon, Lettuce, Tomato & Mayo', featured: true },
      { code: 'C2', name: 'Ham & Swiss Harmony', description: 'Deluxe Ham, Swiss Cheese, Lettuce, Tomato & Dijon Mustard' },
      { code: 'C3', name: 'Tuna Sensation', description: 'Tuna Salad, Lettuce, Tomato & Pickles' },
      { code: 'C4', name: 'Turkey Avocado Bliss', description: 'Ovengold Turkey, Lettuce, Tomato, Avocado & Mayo' },
      { code: 'C5', name: 'Turkey Sensation', description: 'Ovengold Turkey, Lettuce, Tomato & Honey Mustard' },
      { code: 'C6', name: 'Turkey Spice', description: 'Salsalito Turkey, Lettuce, Tomato & Avocado', surcharge: 2 },
      { code: 'C7', name: 'Chicken Caesar Wrap', description: 'Grilled Chicken, Parmesan, Lettuce & Caesar Dressing' },
      { code: 'C8', name: 'American Combo', description: 'Roast Beef, American Cheese, Lettuce & Tomato', surcharge: 2 },
      { code: 'C9', name: 'Spicy Tuna Twist', description: 'Spicy Tuna Salad, Lettuce, Tomato & Cucumbers' },
      {
        code: 'C10',
        name: 'Salsalito Heat',
        description: 'Salsalito Turkey, Jalapeño Pepper Jack Cheese, Lettuce, Jalapeños & Fiery Chipotle Gourmaise',
        surcharge: 2,
      },
      { code: 'C11', name: 'Greek Chicken Wrap', description: 'Grilled Chicken, Feta Cheese, Lettuce, Tomato & Balsamic Vinegar' },
      { code: 'C12', name: 'Egg Salad Delight', description: 'Egg Salad, Bacon, Lettuce & Tomato' },
      { code: 'C13', name: 'Mozzarella Pesto Marvel', description: 'Fresh Mozzarella, Spinach, Tomato & Basil Pesto' },
      { code: 'C14', name: 'BBQ Chicken Wrap', description: 'Grilled Chicken, Vermont Cheddar Cheese, Lettuce, Tomato & BBQ Sauce' },
      { code: 'C15', name: 'Roast Beef Classic', description: 'Roast Beef, Lettuce, Tomato & Chipotle Mayo' },
      { code: 'C16', name: 'Turkey Avocado', description: 'Ovengold Turkey, Lettuce, Tomato, Avocado & Mayo' },
      { code: 'C17', name: 'American Classic', description: 'Tuna Salad, American Cheese, Lettuce & Tomato' },
      { code: 'C18', name: 'Chicken Pesto Wrap', description: 'EverRoast Chicken, Lettuce, Tomato & Pesto' },
      { code: 'C19', name: 'Roast Beef Delight', description: 'Roast Beef, Muenster Cheese, Lettuce, Tomato & Dijon Mustard' },
    ],
  },
  {
    slug: 'signature-hot',
    name: 'Signature Hot Sandwiches',
    blurb: 'H1–H14, pressed and melted.',
    image: '/images/signature-hot.jpg',
    sizes: SIGNATURE_SIZES,
    items: [
      { code: 'H1', name: 'Chicken Supreme', description: 'Grilled Chicken, Bacon, Lettuce, Tomato & Mayo', surcharge: 1 },
      { code: 'H2', name: 'Chicken Parmigiana Crunch', description: 'Breaded Chicken Cutlet, Melted Mozzarella & Marinara Sauce', surcharge: 1 },
      { code: 'H3', name: 'Philly Sizzler', description: 'Sliced Steak, American Cheese, Sautéed Peppers & Onions', surcharge: 1 },
      { code: 'H4', name: 'Reuben Revival', description: 'Pastrami, Melted Swiss Cheese, Sauerkraut & Russian Dressing', surcharge: 1, featured: true },
      { code: 'H5', name: 'Buffalo Chicken Inferno', description: 'Blazing Buffalo Chicken, Lettuce, Tomato & Blue Cheese Dressing' },
      { code: 'H6', name: 'Bacon Ranch Bliss', description: 'Grilled Chicken, Bacon, Lettuce, Tomato & Ranch Dressing', surcharge: 1 },
      { code: 'H7', name: 'Pastrami Madness', description: 'Hot Pastrami, Melted Swiss Cheese & Spicy Mustard' },
      { code: 'H8', name: 'Turkey Cheddar Melt', description: 'Ovengold Turkey, Bacon, Melted Vermont Cheddar Cheese & Honey Mustard', surcharge: 1 },
      { code: 'H9', name: 'Honey Turkey Delight', description: 'Maple Honey Turkey, Melted Swiss Cheese, Caramelized Onions & Honey Mustard' },
      { code: 'H10', name: 'Steakhouse Melt', description: 'Sliced Steak, Provolone & Sautéed Mushrooms', surcharge: 1 },
      { code: 'H11', name: 'Chicken Philly Zinger', description: 'EverRoast Chicken, Melted Provolone, Sautéed Peppers & Onions' },
      { code: 'H12', name: 'Roast Beef Melt', description: 'Roast Beef, Melted Provolone & Horseradish Sauce' },
      { code: 'H13', name: 'BBQ Delight', description: 'Grilled Chicken, Vermont Cheddar Cheese, Red Onions & BBQ Sauce' },
      { code: 'H14', name: 'Chicken Fajita', description: 'Grilled Chicken, Melted Cheese, Sautéed Peppers, Onions & Fajita' },
    ],
  },
  {
    slug: 'veggie-cold',
    name: 'Veggie & Vegan Cold Sandwiches',
    blurb: 'C20–C26, meat-free.',
    image: '/images/veggie-cold.jpg',
    accent: 'green',
    sizes: VEGGIE_SIZES,
    items: [
      { code: 'C20', name: 'Caprese Wonder', description: 'Fresh Mozzarella, Tomato, Basil & Balsamic Glaze', dietary: 'vegetarian', featured: true },
      { code: 'C21', name: 'Mediterranean Fusion', description: 'Grilled Veggies, Hummus, Spinach & Roasted Peppers', dietary: 'vegetarian' },
      { code: 'C22', name: 'Black Bean Salad Wrap', description: 'Peppers, Corn, Cilantro & Lime Dressing', dietary: 'vegetarian' },
      { code: 'C23', name: 'Avocado & Tomato Delight', description: 'Lettuce, Tomato & Avocado', dietary: 'vegetarian' },
      {
        code: 'C24',
        name: 'Spicy Veggie Crunch',
        description: 'Grilled Veggies, Jalapeño Pepper Jack Cheese, Lettuce, Tomato & Fiery Chipotle Gourmaise',
        dietary: 'vegetarian',
      },
      { code: 'C25', name: 'Vegan Hummus Wrap', description: 'Hummus, Lettuce, Tomato & Cucumbers', dietary: 'vegan' },
      { code: 'C26', name: 'Vegan Delight', description: 'Grilled Veggies, Hummus & Spinach', dietary: 'vegan' },
    ],
  },
  {
    slug: 'veggie-hot',
    name: 'Veggie & Vegan Hot Sandwiches',
    blurb: 'H15–H22, meat-free.',
    image: '/images/veggie-hot.jpg',
    accent: 'green',
    sizes: VEGGIE_SIZES,
    items: [
      { code: 'H15', name: 'Grilled Veggie Medley', description: 'With Provolone', dietary: 'vegetarian' },
      { code: 'H16', name: 'Eggplant Parm', description: 'Breaded Eggplant, Melted Mozzarella & Marinara', dietary: 'vegetarian' },
      { code: 'H17', name: 'Mushrooms & Swiss Melt', dietary: 'vegetarian' },
      {
        code: 'H18',
        name: 'Spicy Veggie Sizzler',
        description: 'Grilled Veggies, Jalapeño Pepper Jack Cheese, Lettuce, Tomato & Fiery Chipotle Gourmaise',
        dietary: 'vegetarian',
      },
      { code: 'H19', name: 'Caprese Melt', description: 'Fresh Mozzarella, Tomato, Basil & Balsamic Glaze', dietary: 'vegetarian' },
      { code: 'H20', name: 'Hummus Dream', description: 'Hummus, Lettuce, Tomato & Cucumbers', dietary: 'vegan' },
      { code: 'H21', name: 'Falafel Sensation', description: 'Falafel, Hummus, Lettuce, Tomato, Cucumbers & Tzatziki Sauce', dietary: 'vegan' },
      { code: 'H22', name: 'Roasted Wonder', description: 'Roasted Veggies, Hummus & Spinach', dietary: 'vegan' },
    ],
  },
  {
    slug: 'fat-heroes',
    name: 'Fat Heroes',
    blurb: 'F1–F15, overstuffed.',
    image: '/images/fat-heroes.jpg',
    items: [
      { code: 'F1', name: 'Fat Choppy', description: 'Chopped Cheese, Lettuce, Tomato, Peppers, Onions, Ketchup & Mayo', price: 12.99 },
      { code: 'F2', name: 'Fat Trucker', description: 'Chicken Cutlet, Bacon, Vermont Cheddar Cheese, French Fries & Honey Mustard', price: 12.99, featured: true },
      { code: 'F3', name: 'Fat Spicy', description: 'Chicken Cheesesteak, Mozzarella & Vermont Cheddar Cheeses, Jalapeños, Peppers & Onions', price: 12.99 },
      { code: 'F4', name: 'Fat Chompzilla', description: 'Pastrami, Ovengold Turkey, Swiss Cheese, Sauerkraut & 1000 Island Dressing', price: 12.99 },
      { code: 'F5', name: 'Fat Porky', description: 'Hot Deluxe Ham, Genoa Salami, Pepperoni, Jalapeños & Honey Mustard', price: 12.99 },
      { code: 'F6', name: 'Fat Rumble', description: 'Grilled Chicken, Bacon, Mozzarella, Onion Rings, Fries & Marinara Sauce', price: 12.99 },
      { code: 'F7', name: 'Fat Greasy', description: 'Chicken Cutlet, Prosciutto, Bacon, Fresh Mozzarella, Fries & Marinara Sauce', price: 12.99 },
      { code: 'F8', name: 'Fat Daddy', description: 'Philly Cheesesteak, Mozzarella, Vermont Cheddar & American Cheeses, Onions & French Fries', price: 12.99 },
      { code: 'F9', name: 'Fat Sloppy', description: 'Sloppy Joe, Fried Eggs, Pickles & House Sauce', price: 12.99 },
      { code: 'F10', name: 'Fat Boss', description: 'Cheeseburger, Lettuce, Tomato, French Fries, Mayo & Ketchup', price: 12.99 },
      { code: 'F11', name: 'Fat Belly Buster', description: 'Ovengold Turkey, Deluxe Ham, Roast Beef, Bacon, Provolone, Lettuce, Tomato & House Sauce', price: 12.99 },
      { code: 'F12', name: 'Fat Fajita', description: 'Grilled Chicken, Jalapeño Pepper Jack Cheese, Peppers, Onions & Fiery Chipotle Gourmaise', price: 12.99 },
      { code: 'F13', name: 'Fat Firecracker', description: 'Blazing Buffalo Chicken, Salsalito Turkey, Jalapeño Pepper Jack Cheese, Jalapeños, Grilled Onions & Ranch', price: 12.99 },
      { code: 'F14', name: 'Fat Yum Yum', description: 'Grilled Chicken, Bacon, Fresh Mozzarella, Lettuce, Tomato, Peppers, Onions, Fries & Ranch Dressing', price: 12.99 },
      { code: 'F15', name: 'Fat Veggies Volcano', description: 'Grilled Veggies, Provolone, Fries & Marinara Sauce', price: 12.99 },
    ],
  },
  {
    slug: 'quesadillas',
    name: 'Quesadillas',
    blurb: 'Grilled and loaded with cheese.',
    image: '/images/quesadillas.jpg',
    items: [
      {
        name: 'Chipotle',
        description: 'Grilled Chicken, Fresh Mozzarella & Jalapeño Pepper Jack Cheeses, Tomato, Peppers & Onions',
        price: 11.99,
      },
      {
        name: 'Philly',
        description: 'Steak, Fresh Mozzarella & Vermont Cheddar Cheeses, Jalapeños, Peppers & Onions',
        price: 11.99,
      },
    ],
  },
  {
    slug: 'salads',
    name: 'Salads',
    blurb: 'Five bowls, tossed to order.',
    image: '/images/salads.jpg',
    items: [
      { name: 'Cobb', description: 'Lettuce, Tomato, Avocado, Diced Chicken, Bacon, Hard-Boiled Eggs & Blue Cheese', price: 13.99 },
      {
        name: 'Chef',
        description:
          'Mixed Greens, Tomato, Cucumbers, Deluxe Ham, Ovengold Turkey, Hard-Boiled Eggs, Swiss Cheese, Vermont Cheddar Cheese & choice of dressing',
        price: 11.99,
      },
      { name: 'Greek', description: 'Lettuce, Tomato, Cucumbers, Red Onions, Olives & Feta Cheese', price: 10.99 },
      { name: 'Ranch', description: 'Lettuce, Tomato, Cucumbers, Vermont Cheddar, Croutons & Ranch Dressing', price: 10.99 },
      { name: 'Caesar', description: 'Lettuce, Grated Parmesan & Croutons', price: 9.99 },
    ],
  },
];
