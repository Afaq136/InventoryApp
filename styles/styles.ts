import { StyleSheet } from 'react-native';
import tw from "twrnc";


//This component returns a different stylesheet, based on dark mode.
export const getDynamicStyles = (darkMode: boolean) => StyleSheet.create(
  {
    textStyle: tw`${darkMode ? "text-white" : "text-gray-700"}`,

    blueButtonStyle: tw`${darkMode ? "bg-gray-800" : "bg-white"} mb-4 flex-1 mx-2 py-3 px-4 border border-cyan-500 rounded-md items-center`,
    blueTextStyle: tw`text-cyan-500`,

    redButtonStyle: tw`${darkMode ? "bg-red-800" : "bg-white"} mb-4 flex-1 mx-2 py-3 px-4 border border-red-500 rounded-md items-center`,
    redTextStyle: tw`text-red-500`,

    containerStyle: tw`${darkMode ? "bg-gray-800" : "bg-gray-200"} flex-1 p-5`,
    largeBlueButtonStyle: tw`${darkMode ? "bg-gray-800" : "bg-white"} border border-cyan-500 rounded-2xl p-5 mb-4 items-center`,
    summaryCardStyle: tw`${darkMode ? "bg-gray-800" : "bg-white"} border border-cyan-500 rounded-2xl p-5 mb-4`,
    photoContainer: tw`${darkMode ? "bg-gray-800" : "bg-white"} justify-center items-center border border-cyan-500 rounded-2xl p-5 mb-4`,
    borderCardStyle: tw`${darkMode ? "bg-gray-800" : "bg-gray-200"} flex-1 mx-2 p-6 border border-gray-700 rounded-2xl items-center mb-4`,

    inputContainer: tw`mx-2`,
    textInputStyle: tw`${darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300"} border rounded-sm mb-3 p-1.5`,
    recentItems: tw`${darkMode ? "bg-gray-700" : "bg-white"} p-5 rounded-xl mb-4`,

    actionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    actionButton: tw`${darkMode ? "bg-gray-700" : "bg-gray-300"} flex-1 mx-2 py-3 p-4 rounded-lg items-center`,
    
    header: tw`flex flex-row justify-between items-center h-16`,
    dynamicHeaderStyle: tw`${
      darkMode ? "bg-gray-800" : "bg-white"
    } border-b border-cyan-500`,

    headerTextStyle: tw`text-xl font-bold m-2`,

    itemStyle: tw`${darkMode ? "bg-gray-800" : "bg-white"} p-2 round-md m-2`,
    row: tw`flex-row justify-between mb-3`,
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "#ffffff",
      padding: 20,
      borderRadius: 20,
      margin: 10,
      elevation: 5,
    },
    modalButton: {
      backgroundColor: "#f7f7f7",
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      alignItems: "center",
    }, 
    folder: tw`${darkMode ? "bg-gray-800" : "bg-white"} border border-cyan-500 rounded-2xl p-5 mb-4`,
    selectedFolder: tw`${darkMode ? "bg-cyan-800" : "bg-gray-200"} border border-cyan-500 rounded-2xl p-5 mb-4`    
  })