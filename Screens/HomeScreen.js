import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon5 from 'react-native-vector-icons/FontAwesome5';
import FloatingButton from '../components/floatingButton';

const articles = [
  {
    id: 1,
    title: 'Virtual Hiring',
    category: 'Institute mail',
    description: 'Due to the outbreak of the pandemic, a significant number of employees have lost...',
    label: 'Campus Daemon',
    time: '2 hours ago',
    color: '#FFC5C5',
  },
  {
    id: 2,
    title: 'Lost Debit Card',
    category: 'Lost & Found',
    description: 'A State Bank of India debit card belonging to Mr. Lorem Ipsum has been lost...',
    label: 'Lost & Found',
    time: '2 hours ago',
    color: '#FFD59D',
  },
  {
    id: 3,
    title: 'Open Chess tournament',
    category: 'Event',
    description: 'IIT (ISM) Open Chess tournament, organised by Black Knight Chess Club...',
    label: 'Campus Daemon',
    time: '3 March 19',
    color: '#FECACA',
  },
  {
    id: 4,
    title: 'Parakram is here!',
    category: 'Event',
    description: 'This year, the stage is all set. Beats have paused, breaths held and the legends have...',
    label: 'Pernel Daemon',
    time: '2 hours ago',
    color: '#CDFAFF',
  },
];

const HomeScreen = () => {
  return (
    <View style={styles.container}> 
       
      {/* Scrollable List of Articles */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {articles.map((item) => (
          <View key={item.id} style={styles.cardContainer}>
            {/* Card left side (Text content) */}
            <View style={styles.cardTextContainer}>
              {/* Card title uses header font size (17) */}
              <Text style={styles.cardTitle}>{item.title}</Text>
              {/* Category is considered a "tag" (size 10) */}
              <Text style={styles.cardCategory}>{item.category}</Text>
              {/* Description is "paragraph" (size 14) */}
              <Text style={styles.cardDescription}>{item.description}</Text>
              <View style={styles.cardFooter}>
                {/* Label & time also considered "tags" (size 10) */}
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardTime}>{item.time}</Text>
              </View>
            </View>

            {/* Colored bar + Icons on the right */}
            <View style={[styles.sideBarContainer, { backgroundColor: item.color }]}>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="bookmark-outline" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <FontAwesomeIcon5
                  name="facebook-f"
                  size={20}
                  color="#333"
                  solid={false}
                  style={{ backgroundColor: 'transparent' }}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="share-social-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingButton />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Header Styles */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17, // Header text size
    fontWeight: '700',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // space for floating button
  },

  /* Card Styles */
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth:0.1,
  },
  cardTextContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  /* Titles = 17, Paragraph = 14, Tags = 10 */
  cardTitle: {
    fontSize: 17, // treat card title as a "header"
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 10, // treat category as a "tag"
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14, // paragraph text
    color: '#444',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10, // treat label as a "tag"
    color: '#999',
  },
  cardTime: {
    fontSize: 10, // treat time as a "tag"
    color: '#999',
  },
  sideBarContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
