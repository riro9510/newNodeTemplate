#!/bin/bash

echo "🚀 Starting Node.js project setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install it before continuing."
  exit 1
fi

# Optional: Check if NVM is installed (commented unless required)
# if ! command -v nvm &> /dev/null; then
#   echo "❌ NVM is not installed. Please install it (https://github.com/nvm-sh/nvm) and try again."
#   exit 1
# fi

# Optional: Use latest LTS with NVM
# echo "📦 Using latest LTS Node.js version..."
# nvm install --lts
# nvm use --lts

# Make scripts and husky hooks executable
echo "🔐 Ensuring scripts and hooks are executable..."
chmod +x scripts/*.js 2>/dev/null
chmod +x .husky/* 2>/dev/null

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env if not exists
if [ ! -f .env ]; then
  echo "🔐 Creating default .env file..."
  newValue=$(openssl rand -base64 32)
  touch .env
  echo "PORT=3000" > .env
  echo "DATABASE_URL=your_db_url_here" >> .env
  echo "JWT_SECRET=$newValue" >> .env
else
  echo "✅ .env file already exists."
fi

# Create project structure
echo "📂 Creating base structure..."
node scripts/createStructure.cjs

# Set up Husky if directory exists
if [ -d ".husky" ]; then
  echo "🔧 Setting up Git hooks with Husky..."
  npx husky install
else
  echo "⚠️ Husky not detected. Run manually: npx husky install"
fi

# Detect user's shell and config file
SHELL_NAME=$(basename "$SHELL")
CONFIG_FILE=""

case "$SHELL_NAME" in
  bash) CONFIG_FILE="$HOME/.bashrc" ;;
  zsh) CONFIG_FILE="$HOME/.zshrc" ;;
  fish) CONFIG_FILE="$HOME/.config/fish/config.fish" ;;
  *) CONFIG_FILE="$HOME/.bashrc"
     echo "⚠️ Unknown shell: $SHELL_NAME. Defaulting to .bashrc" ;;
esac

# Add alias if not already present
if ! grep -Fxq "alias tidy='node scripts/alias.js'" "$CONFIG_FILE"; then
  echo "🔗 Adding alias to $CONFIG_FILE"
  echo "alias tidy='node scripts/alias.js'" >> "$CONFIG_FILE"
  source "$CONFIG_FILE"
fi

# Run lint and format
echo "🧹 Running lint and format..."
npm run lint:fix && npm run format

# Done
echo "✅ Node.js project successfully initialized 🎉"
echo "📦 All dependencies installed"
echo "🔧 ESLint, Prettier, Husky, and Commitizen configured"
echo "🧪 .env file and folder structure ready"
echo "✨ Tidy alias is now available – just type: tidy"
echo "🌀 You may need to restart your terminal or run: source $CONFIG_FILE"
