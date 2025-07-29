#!/bin/bash

# Script to remove all animations from the CamerPulse codebase
# This removes animate-spin, animate-pulse, animate-bounce, and transition classes

echo "Removing all animations from CamerPulse codebase..."

# Remove animate-spin classes
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/animate-spin//g'

# Remove animate-pulse classes  
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/animate-pulse//g'

# Remove animate-bounce classes
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/animate-bounce//g'

# Remove transition classes
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/transition-[a-zA-Z-]*//g'

echo "Animation removal complete!"