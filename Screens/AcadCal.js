import React, { useEffect, useRef, useState } from "react";
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

  // refs for auto-scroll
  const monthScrollRef = useRef(null);
  const monthPositions = useRef({});

  // Format date to "MMM'YY" (e.g., "Feb'26")
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

        // ✅ Set current month as default
        const now = new Date();
        const currentMonthKey = formatMonthKey(now);
        setActiveMonth(currentMonthKey);
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

    // sort months chronologically
    const sorted = Object.keys(groups).sort((a, b) => {
      const [ma, ya] = a.split("'");
      const [mb, yb] = b.split("'");
      const da = new Date(`${ma} 01 20${ya}`);
      const db = new Date(`${mb} 01 20${yb}`);
      return da - db;
    });

    return { groups, sorted };
  };

  // ✅ Auto-scroll month bar to active month
  useEffect(() => {
    if (activeMonth && monthScrollRef.current) {
      const x = monthPositions.current[activeMonth];
      if (x !== undefined) {
        monthScrollRef.current.scrollTo({
          x: Math.max(x - 40, 0),
          animated: true,
        });
      }
    }
  }, [activeMonth]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const { groups: groupedEvents, sorted: months } = groupByMonth();

  return (
    <View style={styles.container}>
      {/* Month Slider */}
      <ScrollView
        ref={monthScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.monthBar}
      >
        {months.map((month) => (
          <TouchableOpacity
            key={month}
            onLayout={(e) => {
              monthPositions.current[month] = e.nativeEvent.layout.x;
            }}
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

      {/* Events */}
      <ScrollView style={styles.eventsContainer}>
        {groupedEvents[activeMonth]?.map((event) => {
          const start = new Date(event.startDate).getDate();
          const end = event.endDate
            ? new Date(event.endDate).getDate()
            : null;

          return (
            <View key={event._id} style={styles.eventCard}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateText}>{start}</Text>
                {end && (
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Month bar
  monthBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  monthButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 10,
  },

  activeMonthButton: {
    backgroundColor: "#f97316",
  },

  monthText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },

  activeMonthText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Events
  eventsContainer: {
    paddingHorizontal: 16,
  },

  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  dateColumn: {
    width: 50,
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
    width: 1,
    height: 12,
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
