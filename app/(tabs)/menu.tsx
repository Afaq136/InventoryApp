import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './../context/DarkModeContext';
import { Link, router } from "expo-router";


export default function Menu() {
  const { darkMode, toggleDarkMode } = useTheme(); 
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const theme = darkMode ? 'dark' : 'light';

  const styles = getStyles(theme); 

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Menu</Text>

      <TouchableOpacity style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>FL</Text>
        </View>
        <Link href="/profile" style={styles.link}>User Profile</Link>
      </TouchableOpacity>

      <Text style={styles.text}>MY WORKSPACES</Text>
      <TouchableOpacity style={styles.card} onPress={() => router.push("/ManageWorkspace")}>
        <Text style={styles.cardText} >Organization</Text> 
        <Text style={styles.cardText}>1 Contributor</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Join Organization</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Add New Organization</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Archived Items</Text>
      </TouchableOpacity>

      <View style={styles.card}>
      <Text style={styles.flexText}>Notifications</Text>

        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <View style={styles.card}>
  <Text style={styles.flexText}>Display</Text>
  <View style={styles.row}>
    <Text style={styles.text}>{darkMode ? "Dark Mode" : "Light Mode"}</Text> 
    <Switch
      value={darkMode} 
      onValueChange={toggleDarkMode} 
      trackColor={{ false: "#ccc", true: "#00bcd4" }}
      thumbColor={darkMode ? "#00bcd4" : "#f4f3f4"}
    />
  </View>
</View>
      <Link href="/" style={styles.signOutButton}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Link>
    </View>
  );
}

const getStyles = (theme: string) => {
  const isDarkMode = theme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? 'black' : '#f5f5f5',
      padding: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
      color: isDarkMode ? 'white' : 'black',
    },    
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#00bcd4',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    avatarText: {
      color: 'white',
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#333' : '#ffffff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    link: {
      color: '#00bcd4',
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: isDarkMode ? '#444' : '#ffffff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cardText: {
      color: isDarkMode ? 'white' : 'black',
    },
    flexText: {
      flex: 1,
      color: isDarkMode ? 'white' : 'black',
    },
    text: {
      color: isDarkMode ? 'white' : 'black',
      marginTop: 4,
      marginBottom: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    signOutButton: {
      backgroundColor: '#ff4d4d',
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 20,
    },
    signOutButtonText: {
      textAlign: 'center',
      color: 'white',
    },
  });
};
