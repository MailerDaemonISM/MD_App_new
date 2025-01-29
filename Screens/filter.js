import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { fetchPlacementData } from '../sanity';

const branches_BTech = [
  'ce', 'che', 'cse', 'ece',
  'ee', 'ep', 'ese', 'fme',
  'me', 'mech', 'mme', 'pe'
];

const branches_IntMTech = ['agl', 'agp', 'mnc'];

const Filter = ({ selectedOption, setSelectedOption, setSelectedValue }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const getOptions = async () => {
      try {
        const data = await fetchPlacementData();
        if (!data || !Array.isArray(data)) return;

        if (selectedOption === 'Year') {
          const uniqueYears = Array.from(new Set(data.map(item => item?.year).filter(Boolean))).sort();
          setOptions(uniqueYears.length > 0 ? uniqueYears : ['No Data']);
        } else if (selectedOption === 'Branches') {
          const allBranches = [
            'ALL',
            ...branches_BTech.flat(),
            ...branches_IntMTech.flat(),
          ];
          setOptions(allBranches.length > 0 ? allBranches : ['No Branches']);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (modalVisible) {
      getOptions();
    }
  }, [selectedOption, modalVisible]);

  return (
    <View>
      <View style={styles.bulletContainer}>
        {['Year', 'Branches'].map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.bulletWrapper}
            onPress={() => {
              setSelectedOption(option);
              setModalVisible(true);
            }}
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

      {/* Modal for Year/Branches Selection */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {selectedOption}</Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedValue(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{String(item).toUpperCase()}</Text>
                </TouchableOpacity>
              )}
              style={styles.flatList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bulletContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 10,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#98ddff',
  },
  bulletWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%', 
    maxHeight: '75%', 
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,  
    alignItems: 'center', 
    elevation: 12, 
    justifyContent: 'flex-start',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  optionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  
  optionText: {
    fontSize: 16,
    color: '#555',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#00ADEF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatList: {
    maxHeight: '65%',
    width: '80%',
    
  },
});

export default Filter;
