import { View, Text, StyleSheet, ScrollView, Image, StatusBar,SafeAreaView, } from 'react-native';

const AboutUs = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/md.jpg')} style={styles.logo} />
                <Text style={styles.title}>Mailer Daemon</Text>
            </View>

            <Text style={styles.subtitle}>It's News till it's New</Text>
            <Text style={styles.tagline}>The Student Run Media Body of IIT (ISM) Dhanbad</Text>

            <Text style={styles.paragraph}>
                Founded in 2004, <Text style={styles.highlight}>Mailer Daemon</Text> is the heartbeat of student media at IIT (ISM) Dhanbad. We serve as a bridge between students and the administration, bringing you the latest news, insightful stories, and campus updates.
            </Text>

            <Text style={styles.paragraph}>
                Whether it's an academic breakthrough, a cultural fest, or an exciting sports event, our mission is to keep you informed and engaged. From interviews with distinguished alumni to exclusive event coverages, we ensure you never miss a beat.
            </Text>

            <Text style={styles.subtitle}>Stay Informed, Stay Inspired</Text>

            <Text style={styles.paragraph}>
                Explore student achievements, get career insights, and stay up to date with everything happening on campus. Whether you're looking for academic guidance or want to dive into the vibrant extracurricular scene, <Text style={styles.highlight}>Mailer Daemon</Text> is your go-to source.
            </Text>

            <Text style={styles.paragraph}>
                Join us in celebrating the spirit of IIT (ISM) Dhanbad—stay connected, stay curious, and make every moment count.
            </Text>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF', // full-screen background
    },
    scroll: {
        flex: 1,
        backgroundColor: '#FFFFFF', // ensure ScrollView background also white
    },
    container: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        paddingTop: StatusBar.currentHeight || 20,
        alignItems:'center',
          },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD',
        paddingBottom: 12,
        marginBottom: 10,
    },
    logo: {
        width:85,
        height:85,
        borderRadius: 10,
        borderColor:"#ffffff",
        marginRight: 12,
        alignItems:'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#E67E22',
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 19,
        color: '#555555',
        textAlign: 'center',
        marginBottom: 15,
    },
    paragraph: {
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'justify',
        color: '#444444',
        marginBottom: 15,
    },
    highlight: {
        fontWeight: 'bold',
        color: '#E67E22',
    },
});

export default AboutUs;