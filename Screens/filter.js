
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Filter = ({ selectedOption, setSelectedOption }) => {
  return (
    <View style={styles.bulletContainer}>
      {['Year', 'Branches'].map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.bulletWrapper}
          onPress={() => setSelectedOption(option)}
        >
          <View
            style={[
              styles.bulletOuter,
              selectedOption === option && styles.bulletOuterActive,
            ]}
          >
            {selectedOption === option && <View style={styles.bulletInner} />}
          </View>
          <Text
            style={[
              styles.optionText,
              selectedOption === option && styles.optionTextActive,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bulletContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    borderColor: '#98ddff',
  },
  bulletWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  bulletOuter: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00ADEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletOuterActive: {
    backgroundColor: '#00ADEF',
  },
  bulletInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 15,
    color: '#888',
    marginLeft: 5,
  },
  optionTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Filter;
