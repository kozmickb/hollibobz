import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "dest_meta_v1_";

// Clear cached meta that might have old generic quick facts
export async function clearLegacyCachedMeta() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const metaKeys = keys.filter(key => key.startsWith(KEY_PREFIX));
    
    for (const key of metaKeys) {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const meta = JSON.parse(raw);
          
          // Check if this has the old generic quick facts
          const hasGenericFacts = meta.quickFacts?.some((fact: any) => 
            fact.value?.includes('Local currency or EUR/USD') ||
            fact.value?.includes('Local language; English varies') ||
            fact.value?.includes('Shoulder seasons for fewer crowds') ||
            fact.value?.includes('Walk/metro/trams in centre')
          );
          
          if (hasGenericFacts) {
            console.log('Clearing legacy cached meta for:', key);
            await AsyncStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.log('Error processing key:', key, error);
      }
    }
  } catch (error) {
    console.log('Error clearing legacy cache:', error);
  }
}
