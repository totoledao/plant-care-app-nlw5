import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/core'

import { Header } from '../componets/Header';
import { EnvironmentButton } from '../componets/EnvironmentButton';
import { PlantCardPrimary } from '../componets/PlantCardPrimary';
import { Load } from '../componets/Load';
import { PlantSave } from './PlantSave';

import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import api from '../services/api';

interface EnvironmentProps {
  key: string;
  title: string;
}

interface PlantsProps {
  id: string;
  name: string;
  about: string;
  water_tips: string;
  photo: string;
  environments: [string];
  frequency: {
    times: number;
    repeat_every: string;
  }
}

export function PlantSelect () {

  const navigation = useNavigation();

  const [environments, setEnvironments] = useState<EnvironmentProps[]>([]);
  const [plants, setPlants] = useState<PlantsProps[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantsProps[]>([]);
  const [environmentSelected, setEnvironmentSelected] = useState('all');
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
    
  function handleEnvironmentSelected(environment : string) {

    setEnvironmentSelected(environment);

    if(environment === 'all' )
      return setFilteredPlants(plants);

    const filtered = plants.filter(plant =>
      plant.environments.includes(environment)     
    )

    setFilteredPlants(filtered);    
  }

  async function fetchPlants() {
    const { data } = await api.get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);

    if(!data)
      return setLoading(true);

    if(page > 1){
      setPlants(oldValue => [ ...oldValue, ...data])
      setFilteredPlants(oldValue => [ ...oldValue, ...data])
    } else {
      setPlants(data);  
      setFilteredPlants(data);
    }    
    
    setLoading (false);
    setLoadingMore (false);
  }

  function handleFetchMore(distance: number) {  
    if(distance < 1)
      return;

    setLoadingMore(true)
    setPage(oldValue => oldValue + 1)
    fetchPlants();
  }

  function handlePlantSelect(plant: PlantsProps) {    
    navigation.navigate('PlantSave', { plant });
  }

  useEffect(() => {
    async function fetchEnvironment() {
      const { data } = await api.get('plants_environments?_sort=title&_order=asc');
      setEnvironments([
        {
          key: 'all',
          title: 'Todos',
        },
        ...data
      ]);
    }

    fetchEnvironment();    

  },[])

  useEffect(() => {
    fetchPlants();
  },[])

  if(loading)
    return <Load />  

  return(
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Header />
        <Text style={styles.title}>
        Em qual ambiente        
        </Text>       
        <Text style={styles.subtitle}>
        você quer colocar sua planta?       
        </Text>
      </View>
      
      <View>
        <FlatList
          data={environments}
          keyExtractor={(item) => String(item.key)}
          renderItem={( {item} ) => (
            <EnvironmentButton
              title={item.title}
              active={item.key === environmentSelected}
              onPress={() => handleEnvironmentSelected(item.key)}              
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.environmentList}
        />
      </View>

      <View style={styles.plantCards}>
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => String(item.id)}
          renderItem={( {item} ) => (
            <PlantCardPrimary
              data={item}
              onPress={() => handlePlantSelect(item)}              
            />
          )}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={styles.plantCardsContainerStyle}
          onEndReachedThreshold={0.1}
          onEndReached={({ distanceFromEnd }) =>
            handleFetchMore(distanceFromEnd)
          }
          ListFooterComponent={
            loadingMore
            ? <ActivityIndicator color={colors.green} />
            : <></>
          }
        />      
      </View>  
      
    </SafeAreaView>    
  )  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {       
    paddingHorizontal: 30
  },
  title: {
    fontSize: 17,
    lineHeight: 20,
    marginTop: 15,
    fontFamily: fonts.heading,
    color: colors.heading
  },
  subtitle: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 20,
    color: colors.heading
  },
  environmentList: {    
    height: 40,
    justifyContent: 'center',    
    marginVertical:32
  },
  plantCards: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center'
  },
  plantCardsContainerStyle : {    
    justifyContent: 'center'
  }
});