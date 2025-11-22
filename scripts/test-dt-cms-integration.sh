#!/bin/bash

# Script to test page-speed-forms integration with dt-cms/Source
# This script:
# 1. Builds the page-speed-forms library
# 2. Links it locally to dt-cms/Source
# 3. Verifies the integration
# 4. Provides instructions for testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
FORMS_DIR="/Users/jordanhudgens/code/dashtrack/utility-modules/page-speed-forms"
CMS_DIR="/Users/jordanhudgens/code/dashtrack/dt-cms/Source"

echo -e "${GREEN}=== Page Speed Forms Integration Test ===${NC}\n"

# Step 1: Build the forms library
echo -e "${YELLOW}Step 1: Building page-speed-forms library...${NC}"
cd "$FORMS_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Running build..."
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build successful${NC}\n"
else
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
fi

# Step 2: Check if dt-cms exists
if [ ! -d "$CMS_DIR" ]; then
  echo -e "${RED}✗ dt-cms/Source directory not found at: $CMS_DIR${NC}"
  exit 1
fi

# Step 3: Link the library
echo -e "${YELLOW}Step 2: Linking page-speed-forms to dt-cms/Source...${NC}"

cd "$FORMS_DIR"
npm link

cd "$CMS_DIR"
npm link @opensite/page-speed-forms

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Library linked successfully${NC}\n"
else
  echo -e "${RED}✗ Failed to link library${NC}"
  exit 1
fi

# Step 4: Verify the demo page exists
echo -e "${YELLOW}Step 3: Verifying integration files...${NC}"

DEMO_PAGE="$CMS_DIR/src/pages/examples/page-speed-forms-demo.tsx"
DOCS_FILE="$CMS_DIR/docs/page-speed-forms-integration-example.md"

if [ -f "$DEMO_PAGE" ]; then
  echo -e "${GREEN}✓ Demo page found: src/pages/examples/page-speed-forms-demo.tsx${NC}"
else
  echo -e "${RED}✗ Demo page not found${NC}"
  echo "Please ensure the demo page is created at: $DEMO_PAGE"
  exit 1
fi

if [ -f "$DOCS_FILE" ]; then
  echo -e "${GREEN}✓ Documentation found: docs/page-speed-forms-integration-example.md${NC}"
else
  echo -e "${YELLOW}⚠ Documentation not found (optional)${NC}"
fi

# Step 5: Check package.json
echo -e "\n${YELLOW}Step 4: Checking dt-cms package.json...${NC}"

cd "$CMS_DIR"

if grep -q "@legendapp/state" package.json; then
  VERSION=$(grep "@legendapp/state" package.json | sed 's/.*: "//;s/".*//')
  echo -e "${GREEN}✓ @legendapp/state found (version: $VERSION)${NC}"

  if [ "$VERSION" = "3.0.0-beta.42" ]; then
    echo -e "${GREEN}✓ Version matches page-speed-forms dependency${NC}"
  else
    echo -e "${YELLOW}⚠ Version mismatch: dt-cms uses $VERSION, forms uses 3.0.0-beta.42${NC}"
  fi
else
  echo -e "${RED}✗ @legendapp/state not found in dt-cms package.json${NC}"
fi

# Step 6: Success message and instructions
echo -e "\n${GREEN}=== Integration Test Successful ===${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Start the dt-cms development server:"
echo "   cd $CMS_DIR"
echo "   pnpm dev"
echo ""
echo "2. Navigate to the demo page:"
echo "   http://localhost:3000/examples/page-speed-forms-demo"
echo ""
echo "3. Uncomment the form implementations in the demo page:"
echo "   Edit: src/pages/examples/page-speed-forms-demo.tsx"
echo "   Remove the comment blocks around the form code"
echo ""
echo "4. Test the forms:"
echo "   - Try submitting empty fields (validation)"
echo "   - Enter valid data and submit"
echo "   - Check browser console for form values"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "- Integration guide: $DOCS_FILE"
echo "- Library README: $FORMS_DIR/README.md"
echo "- Test examples: $FORMS_DIR/src/core/__tests__/"
echo ""
echo -e "${YELLOW}To unlink:${NC}"
echo "cd $CMS_DIR && npm unlink @opensite/page-speed-forms"
echo "cd $FORMS_DIR && npm unlink"
echo ""
echo -e "${GREEN}Happy testing! 🎉${NC}"
