# Destination Images Maintenance Guide

## Overview
This guide explains how to properly maintain and update destination images in the Odeysync app.

## File Location
- **Main file**: `src/utils/destinationImages.ts`
- **Image mapping**: Lines 12-76 contain the destination-to-image mappings
- **Fallback images**: Lines 84-93 contain backup images for unmapped destinations

## How Image Resolution Works

1. **Input**: Destination name (e.g., "Abu Dhabi")
2. **Normalization**: Converts to lowercase, removes accents/diacritics
3. **Alias mapping**: Handles common misspellings/variations
4. **Exact matching**: Finds exact match in destinationImageMap
5. **Fuzzy matching**: Uses Levenshtein distance for similar names
6. **Fallback**: Uses deterministic hash for unmapped destinations

## Adding a New Destination Image

```typescript
// In destinationImageMap object:
'new destination': 'https://images.unsplash.com/photo-[photo-id]?w=800&h=400&fit=crop&q=80',
```

### Requirements for Image URLs:
- ✅ Must be HTTPS
- ✅ Must be from Unsplash or Pexels (validated automatically)
- ✅ Must have dimensions around 800x400
- ✅ Must be appropriate for the destination
- ✅ Must be high-quality and suitable for the app

## Updating Existing Images

1. Find the destination in the `destinationImageMap`
2. Replace the photo ID in the Unsplash URL
3. Test the change by running the app
4. Use `npx expo start --clear` to clear any cached images

## Validation & Testing

### Automatic Validation:
- All image URLs are validated for HTTPS and proper domain
- Invalid URLs will log warnings in development
- Invalid URLs fall back to default scenic images

### Manual Testing:
- Call `testImageMappings()` in development to verify mappings
- Check console logs for any validation warnings
- Verify images load correctly in the Trips section

## Common Issues & Solutions

### Issue: Wrong image showing for a destination
**Solution**: Check if the image URL points to the correct location. Update the photo ID.

### Issue: Image not loading
**Solution**: Verify the URL is valid and accessible. Check console for validation warnings.

### Issue: Caching problems
**Solution**: Use `npx expo start --clear` to clear Metro bundler cache.

## Best Practices

1. **Always test changes**: Use development mode to verify image mappings work
2. **Use high-quality images**: Ensure images are appropriate and high-resolution
3. **Follow naming conventions**: Use lowercase keys in the mapping
4. **Add aliases**: Include common misspellings and variations
5. **Document changes**: Update this guide when making significant changes

## Recent Changes

- **2024-08-XX**: Fixed Abu Dhabi image URL (was showing Paris image)
- **2024-08-XX**: Added image URL validation system
- **2024-08-XX**: Added development testing utilities

## Troubleshooting

If you encounter issues:

1. Check console logs for validation warnings
2. Verify image URLs are accessible
3. Clear Metro cache: `npx expo start --clear`
4. Test with `testImageMappings()` function
5. Check that destination names match exactly (case-insensitive)

## Support

For help with destination images, check:
- Console logs for validation warnings
- Unsplash/Pexels for new image sources
- Development tools for testing mappings
