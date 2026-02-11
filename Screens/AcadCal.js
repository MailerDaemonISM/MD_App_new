import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { client } from "../sanity";

export default function AcademicCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(null);
  
  // Ref for the horizontal month bar to enable auto-scrolling
  const monthScrollRef = useRef(null);

  // Helper: Format date to "MMM'YY" (e.g., "Feb'26")
  const formatMonthKey = (date) =>
    `${date.toLocaleString("default", { month: "short" })}'${date
      .getFullYear()
      .toString()
      .slice(-2)}`;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "academic_event"] | order(startDate asc){
            _id,
            title,
            startDate,
            endDate
          }`
        );
        setEvents(data);

        if (data.length > 0) {
          // Get the current real-world month key
          const currentMonthKey = formatMonthKey(new Date());

          // Check if any fetched events actually exist in the current month
          const hasCurrentMonth = data.some(
            (event) => formatMonthKey(new Date(event.startDate)) === currentMonthKey
          );

          if (hasCurrentMonth) {
            setActiveMonth(currentMonthKey);
          } else {
            // Fallback: If no events this month, show the first month available in data
            setActiveMonth(formatMonthKey(new Date(data[0].startDate)));
          }
        }
      } catch (err) {
        console.error("❌ Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const groupByMonth = () => {
    const groups = {};
    events.forEach((event) => {
      if (!event.startDate) return;
      const date = new Date(event.startDate);
      const monthKey = formatMonthKey(date);

      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(event);
    });

    const sorted = Object.keys(groups).sort((a, b) => {
      const [ma, ya] = a.split("'");
      const [mb, yb] = b.split("'");
      const da = new Date(`${ma} 01 20${ya}`);
      const db = new Date(`${mb} 01 20${yb}`);
      return da - db;
    });

    return { groups, sorted };
  };

  const { groups: groupedEvents, sorted: months } = groupByMonth();

  // Auto-scroll the horizontal bar to the active month whenever it changes
  useEffect(() => {
    if (activeMonth && months.length > 0) {
      const index = months.indexOf(activeMonth);
      if (index !== -1) {
        // Approximate width: button width (~80) + margin
        monthScrollRef.current?.scrollTo({
          x: index * 90 - 20, 
          animated: true,
        });
      }
    }
  }, [activeMonth, months]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Month Bar */}
      <View>
        <ScrollView
          ref={monthScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthBar}
          contentContainerStyle={{ paddingRight: 32 }}
        >
          {months.map((month) => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthButton,
                activeMonth === month && styles.activeMonthButton,
              ]}
              onPress={() => setActiveMonth(month)}
            >
              <Text
                style={[
                  styles.monthText,
                  activeMonth === month && styles.activeMonthText,
                ]}
              >
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
        {groupedEvents[activeMonth]?.map((event) => {
          const start = new Date(event.startDate).getDate();
          const end = event.endDate ? new Date(event.endDate).getDate() : null;

          return (
            <View key={event._id} style={styles.eventCard}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateText}>{start}</Text>
                {end && end !== start && (
                  <>
                    <View style={styles.dateDivider} />
                    <Text style={styles.dateText}>{end}</Text>
                  </>
                )}
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
            </View>
          );
        })}
        {/* Padding at bottom for scroll comfort */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monthBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 60,
  },
  monthButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 35,
  },
  activeMonthButton: {
    backgroundColor: "#f97316",
  },
  monthText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  activeMonthText: {
    color: "#fff",
    fontWeight: "700",
  },
  eventsContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
    // shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    // elevation (Android)
    elevation: 3,
  },
  dateColumn: {
    width: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 12,
    paddingRight: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  dateDivider: {
    width: 15,
    height: 2,
    backgroundColor: "#9ca3af",
    marginVertical: 2,
  },
  infoColumn: {
    flex: 1,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: "#374151",
    fontWeight: "500",
  },
});