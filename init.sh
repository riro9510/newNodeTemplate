#!/bin/bash

echo "🚀 Initializing your Node.js Project Template..."

# Define colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1 – Check for Node
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed. Please install it and try again.${NC}"
  exit 1
fi

# Optional: Check if NVM is installed (commented unless required)
# if ! command -v nvm &> /dev/null; then
#   echo -e "${RED}❌ NVM is not installed. Please install it (https://github.com/nvm-sh/nvm) and try again.${NC}"
#   exit 1
# fi

# Step 2 – Use latest LTS (uncomment if using nvm)
# echo "📦 Using latest LTS Node.js version..."
# nvm install --lts
# nvm use --lts

# Step 3 – Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

# Step 4 – Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo -e "${GREEN}🔐 Creating default .env file...${NC}"
newValue=$(openssl rand -base64 32)
# Create the .env file
touch .env

# Adding content
echo "PORT=3000" > .env
echo "DATABASE_URL=your_db_url_here" >> .env
echo "JWT_SECRET=$newValue" >> .env

else
  echo -e "${GREEN}✅ .env file already exists.${NC}"
fi

# Step 5 – Generate project structure
echo -e "${GREEN}📁 Creating folder structure...${NC}"
node ./scripts/createStructure.js

# Optional: Set up Husky (only if you want auto-setup)
if [ -d ".husky" ]; then
  echo -e "${GREEN}🔧 Setting up Git hooks with Husky...${NC}"
  npx husky install
else
  echo -e "${RED}⚠️ Husky not detected. Run manually: npx husky install${NC}"
fi

echo -e "${GREEN}🎉 Project initialized successfully!${NC}"
