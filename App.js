import React, { useState, useEffect, useCallback, memo } from "react";
import {
  FlatList,
  TextInput,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Alert,
} from "react-native";

const ListItem = memo(({ item }) => {
  return (
    <View style={styles.containerItemList}>
      <Text>Cep: {item.cep} </Text>
      <Text>logradouro: {item.logradouro} </Text>
      <Text>complemento: {item.complemento} </Text>
      <Text>bairro: {item.bairro} </Text>
      <Text>localidade: {item.localidade} </Text>
      <Text>Uf: {item.uf} </Text>
      <Text>unidade: {item.unidade} </Text>
      <Text>Ibge: {item.ibge} </Text>
      <Text>Gia {item.gia} </Text>
    </View>
  );
});

const reCpf = /^([\d]{5})\-?/;

export default () => {
  const [dados, setDados] = useState();
  const [pesquisas, setPesquisas] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(async () => {
    const { getItem } = AsyncStorage;
    const pesquisas = await getItem("pesquisa");
    setPesquisas(JSON.parse(pesquisas));
  }, []);

  const validation = useCallback(
    async (cep = "") => {
      if (reCpf.test(cep)) {
        const { setItem } = AsyncStorage;

        try {
          const value = await (
            await fetch(`https://viacep.com.br/ws/${cep}/json/`)
          ).json();

          let pesquisass = [];
          if (pesquisas && pesquisas.length > 0) {
            if (pesquisas.findIndex((v) => v.cep === value) === -1) {
              pesquisass = [value, ...pesquisas];
            } else {
              pesquisass = pesquisas;
            }
          } else {
            pesquisass = [value];
          }

          setItem("pesquisa", JSON.stringify(pesquisass));
          setDados(value);
          setPesquisas(pesquisass);
        } catch (error) {
          Alert.alert("Erro", "Cep não encontrado");
        }
      }
    },
    [busca]
  );

  const AtualizarValorBusca = (cepStr = "") => {
    setBusca(cepStr.replace(reCpf, "$1-"));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Meu CEP</Text>
      <TextInput
        style={styles.input}
        value={busca}
        maxLength={9}
        keyboardType="numeric"
        placeholderTextColor="#fff"
        placeholder="Digite seu cep aqui"
        onChangeText={(cep) => AtualizarValorBusca(cep)}
        onSubmitEditing={() => busca.length === 10 && validation(busca)}
        onBlur={() => busca.length === 10 && validation(busca)}
      />

      {dados && (
        <View style={styles.dataContainer}>
          <Text>Cep: {dados.cep} </Text>
          <Text>logradouro: {dados.logradouro} </Text>
          <Text>complemento: {dados.complemento} </Text>
          <Text>bairro: {dados.bairro} </Text>
          <Text>localidade: {dados.localidade} </Text>
          <Text>Uf: {dados.uf} </Text>
          <Text>unidade: {dados.unidade} </Text>
          <Text>Ibge: {dados.ibge} </Text>
          <Text>Gia {dados.gia} </Text>
        </View>
      )}

      <View style={styles.containerFlatList}>
        <FlatList
          data={pesquisas}
          extraData={pesquisas}
          keyExtractor={(i, index) => `${index}`}
          renderItem={({ item }) => <ListItem item={item} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  instructions: {
    textAlign: "center",
    color: "#333",
    marginBottom: 5,
  },
  containerItemList: {
    width: "100%",
    backgroundColor: "lightgray",
    padding: 15,
  },
  containerFlatList: { flex: 2.5, backgroundColor: "lightgray" },
  input: {
    width: "100%",
    backgroundColor: "darkslategray",
    color: "white",
  },
  dataContainer: { backgroundColor: "lightyellow", flex: 1 },
});
