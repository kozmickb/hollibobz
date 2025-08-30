import { validateChecklistDoc } from '../validate';

describe('validateChecklistDoc', () => {
  it('should validate a correct checklist document', () => {
    const validDoc = {
      tripTitle: "Weekend in Paris",
      sections: [
        {
          title: "Day 1",
          items: ["Visit Eiffel Tower", "Lunch at café"]
        },
        {
          title: "Day 2", 
          items: ["Louvre Museum", "Seine river cruise"]
        }
      ]
    };

    const result = validateChecklistDoc(validDoc);
    expect(result).toEqual(validDoc);
  });

  it('should return null for missing tripTitle', () => {
    const invalidDoc = {
      sections: [
        {
          title: "Day 1",
          items: ["Visit Eiffel Tower"]
        }
      ]
    };

    const result = validateChecklistDoc(invalidDoc);
    expect(result).toBeNull();
  });

  it('should return null for non-string tripTitle', () => {
    const invalidDoc = {
      tripTitle: 123,
      sections: []
    };

    const result = validateChecklistDoc(invalidDoc);
    expect(result).toBeNull();
  });

  it('should return null for missing sections array', () => {
    const invalidDoc = {
      tripTitle: "Test Trip"
    };

    const result = validateChecklistDoc(invalidDoc);
    expect(result).toBeNull();
  });

  it('should return null for non-array sections', () => {
    const invalidDoc = {
      tripTitle: "Test Trip",
      sections: "not an array"
    };

    const result = validateChecklistDoc(invalidDoc);
    expect(result).toBeNull();
  });

  it('should return null for section with missing title', () => {
    const invalidDoc = {
      tripTitle: "Test Trip",
      sections: [
        {
          items: ["Test item"]
        }
      ]
    };

    const result = validateChecklistDoc(invalidDoc);
    expect(result).toBeNull();
  });

  it('should return null for section with non-string title', () => {
    const invalidDoc = {
      tripTitle: "Test Trip",
      sections: [
        {
          title: 123,
          items: ["Test item"]
        }
      ]
    };

    const result = validateChecklistDoc(invalidDoc);
    expect(result).toBeNull();
  });

  it('should return null for section with non-array items', () => {
    const invalidDoc = {
      tripTitle: "Test Trip",
      sections: [
        {
          title: "Day 1",
          items: "not an array"
        }
      ]
    };

    const result = validateChecklistDoc(invalidDoc);
    expect(result).toBeNull();
  });

  it('should return null for section with non-string items', () => {
    const invalidDoc = {
      tripTitle: "Test Trip",
      sections: [
        {
          title: "Day 1",
          items: ["Valid item", 123, "Another valid item"]
        }
      ]
    };

    const result = validateChecklistDoc(invalidDoc);
    expect(result).toBeNull();
  });

  it('should handle empty sections array', () => {
    const validDoc = {
      tripTitle: "Test Trip",
      sections: []
    };

    const result = validateChecklistDoc(validDoc);
    expect(result).toEqual(validDoc);
  });

  it('should handle empty items array', () => {
    const validDoc = {
      tripTitle: "Test Trip",
      sections: [
        {
          title: "Empty Day",
          items: []
        }
      ]
    };

    const result = validateChecklistDoc(validDoc);
    expect(result).toEqual(validDoc);
  });

  it('should return null for null input', () => {
    const result = validateChecklistDoc(null);
    expect(result).toBeNull();
  });

  it('should return null for undefined input', () => {
    const result = validateChecklistDoc(undefined);
    expect(result).toBeNull();
  });
});
