import React, { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'AIzaSyCoeS4B7Nar_jCT6tUU-w0nNRxdOTUHRRA';
const PROJECT_ID = 'vyanktesh-drycleaners';
const SHOP_NUMBER = '8806584063';

export default function App() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  const [service, setService] = useState('');
  const [cloth, setCloth] = useState('');
  const [orderType, setOrderType] = useState('');
  const [note, setNote] = useState('');

  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Saved profile load
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const savedProfile = await AsyncStorage.getItem(
        'vyanktesh_profile'
      );

      if (savedProfile) {
        const profile = JSON.parse(savedProfile);

        setName(profile.name || '');
        setMobile(profile.mobile || '');
        setAddress(profile.address || '');
        setProfileSaved(true);
      }
    } catch (error) {
      console.log('Profile load error:', error);
    }
  }

  // Profile save
  async function saveProfile() {
    if (!name || !mobile || !address) {
      setMessage('⚠️ नाव, मोबाईल आणि पत्ता भरा.');
      return;
    }

    try {
      const profile = {
        name: name,
        mobile: mobile,
        address: address,
      };

      await AsyncStorage.setItem(
        'vyanktesh_profile',
        JSON.stringify(profile)
      );

      setProfileSaved(true);
      setMessage('✅ Profile Saved!');
    } catch (error) {
      console.log('Profile save error:', error);
      setMessage('❌ Profile save झाली नाही.');
    }
  }

  // Firebase order
  async function placeOrder() {
    if (!name || !mobile || !address) {
      setMessage('⚠️ आधी Profile पूर्ण भरा.');
      return;
    }

    if (!service || !cloth || !orderType) {
      setMessage(
        '⚠️ Service, कपड्याचा प्रकार आणि Pickup/Delivery निवडा.'
      );
      return;
    }

    setSaving(true);
    setMessage('⏳ Order save होत आहे...');

    try {
      // Anonymous Firebase login
      const loginResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            returnSecureToken: true,
          }),
        }
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(
          loginData.error?.message || 'Firebase login failed'
        );
      }

      const idToken = loginData.idToken;
      const customerId = loginData.localId;

      // Save order in Firestore
      const firestoreResponse = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            fields: {
              customerName: {
                stringValue: name,
              },

              mobile: {
                stringValue: mobile,
              },

              address: {
                stringValue: address,
              },

              service: {
                stringValue: service,
              },

              cloth: {
                stringValue: cloth,
              },

              orderType: {
                stringValue: orderType,
              },

              note: {
                stringValue: note,
              },

              customerId: {
                stringValue: customerId,
              },
            },
          }),
        }
      );

      const firestoreData = await firestoreResponse.json();

      if (!firestoreResponse.ok) {
        throw new Error(
          firestoreData.error?.message || 'Order save failed'
        );
      }

      setMessage(
        '✅ Order Successful!\nतुमची Order Firebase मध्ये save झाली आहे.'
      );

      setService('');
      setCloth('');
      setOrderType('');
      setNote('');
    } catch (error) {
      console.log(error);

      setMessage(
        '❌ Order save झाली नाही.\nकृपया पुन्हा प्रयत्न करा.'
      );
    }

    setSaving(false);
  }

  function callShop() {
    Linking.openURL(`tel:${SHOP_NUMBER}`);
  }

  function whatsappShop() {
    Linking.openURL(`https://wa.me/91${SHOP_NUMBER}`);
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        व्यंकटेश ड्रायक्लिनर्स
      </Text>

      <Text style={styles.subtitle}>
        Customer App
      </Text>

      {/* PROFILE */}

      <Text style={styles.heading}>
        👤 तुमची Profile
      </Text>

      <TextInput
        style={styles.input}
        placeholder="तुमचे नाव"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="मोबाईल नंबर"
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
      />

      <TextInput
        style={styles.input}
        placeholder="तुमचा पत्ता"
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity
        style={styles.profileButton}
        onPress={saveProfile}
      >
        <Text style={styles.buttonText}>
          {profileSaved
            ? '✅ Profile Update करा'
            : 'Profile Save करा'}
        </Text>
      </TouchableOpacity>

      {/* SERVICE */}

      <Text style={styles.heading}>
        🧺 Service
      </Text>

      <View style={styles.row}>

        <TouchableOpacity
          style={
            service === 'Dryclean'
              ? styles.selected
              : styles.option
          }
          onPress={() => setService('Dryclean')}
        >
          <Text>Dryclean</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            service === 'Washing'
              ? styles.selected
              : styles.option
          }
          onPress={() => setService('Washing')}
        >
          <Text>Washing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            service === 'Ironing'
              ? styles.selected
              : styles.option
          }
          onPress={() => setService('Ironing')}
        >
          <Text>Ironing</Text>
        </TouchableOpacity>

      </View>

      {/* CLOTH */}

      <Text style={styles.heading}>
        👕 कपड्याचा प्रकार
      </Text>

      <View style={styles.row}>

        <TouchableOpacity
          style={
            cloth === 'Shirt'
              ? styles.selected
              : styles.option
          }
          onPress={() => setCloth('Shirt')}
        >
          <Text>Shirt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            cloth === 'Pant'
              ? styles.selected
              : styles.option
          }
          onPress={() => setCloth('Pant')}
        >
          <Text>Pant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            cloth === 'Saree'
              ? styles.selected
              : styles.option
          }
          onPress={() => setCloth('Saree')}
        >
          <Text>Saree</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            cloth === 'Coat'
              ? styles.selected
              : styles.option
          }
          onPress={() => setCloth('Coat')}
        >
          <Text>Coat</Text>
        </TouchableOpacity>

      </View>

      {/* PICKUP / DELIVERY */}

      <Text style={styles.heading}>
        🚚 Pickup / Delivery
      </Text>

      <View style={styles.row}>

        <TouchableOpacity
          style={
            orderType === 'Pickup'
              ? styles.selected
              : styles.option
          }
          onPress={() => setOrderType('Pickup')}
        >
          <Text>Pickup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            orderType === 'Delivery'
              ? styles.selected
              : styles.option
          }
          onPress={() => setOrderType('Delivery')}
        >
          <Text>Delivery</Text>
        </TouchableOpacity>

      </View>

      {/* NOTE */}

      <TextInput
        style={styles.note}
        placeholder="काही Note असल्यास लिहा"
        multiline
        value={note}
        onChangeText={setNote}
      />

      {/* ORDER */}

      <TouchableOpacity
        style={styles.orderButton}
        onPress={placeOrder}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Saving...' : 'Order करा'}
        </Text>
      </TouchableOpacity>

      {/* MESSAGE */}

      {message !== '' && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            {message}
          </Text>
        </View>
      )}

      {/* CONTACT */}

      <Text style={styles.contactTitle}>
        📞 संपर्क
      </Text>

      <TouchableOpacity
        style={styles.callButton}
        onPress={callShop}
      >
        <Text style={styles.contactText}>
          📞 Call करा
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={whatsappShop}
      >
        <Text style={styles.contactText}>
          💬 WhatsApp करा
        </Text>
      </TouchableOpacity>

      <Text style={styles.number}>
        8806584063
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },

  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },

  heading: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
    fontSize: 16,
  },

  note: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 13,
    height: 80,
    marginTop: 15,
    textAlignVertical: 'top',
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  option: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },

  selected: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#111',
    marginRight: 8,
    marginBottom: 8,
  },

  profileButton: {
    backgroundColor: '#555',
    padding: 14,
    borderRadius: 10,
    marginTop: 5,
  },

  orderButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 15,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },

  messageBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },

  messageText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },

  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
  },

  callButton: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  whatsappButton: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },

  contactText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },

  number: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 30,
  },
});