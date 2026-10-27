let pokemon_name_input = document.querySelector("#pokemon-input")
let region_name_input = document.querySelector("#region-input")
let type_name_input = document.querySelector("#tipo-input")
let apply_filter_btn = document.querySelector("#aplicar-filtros-btn")
let clear_filter_btn = document.querySelector("#limpar-filtros-btn")
let pokemons_area = document.querySelector("#pokemons")
let page_number = document.querySelector("#page-number")
let last_btn = document.querySelector("#last")
let next_btn = document.querySelector("#next")
let pagina_atual = 1
let paginas_maximas = Math.ceil(1025/20)

last_btn.addEventListener("click", () =>{
    if(pagina_atual > 1){
         pagina_atual--
        carregarPagina()
    }
})

next_btn.addEventListener("click", () =>{
    if(pagina_atual < paginas_maximas){
        pagina_atual++
        carregarPagina()
    }
})

async function buscarDados(url){
    const resposta = await fetch(url)

    if(!resposta.ok){
        throw new Error(`Erro ao consultar a API: ${resposta.status}`)
    }

    return resposta.json()
}

async function buscarPokemons(limit, offset){
    return buscarDados(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
}

async function buscarPokemon(nome){
    return buscarDados(`https://pokeapi.co/api/v2/pokemon/${nome}`)
}


const regioesPorGeracao = new Map()

async function buscarRegiao(pokemon){
    const especie = await buscarDados(pokemon.species.url)
    const urlGeracao = especie.generation.url

    if(!regioesPorGeracao.has(urlGeracao)){
        const geracao = await buscarDados(urlGeracao)
        regioesPorGeracao.set(urlGeracao, geracao.main_region.name)
    }

    return regioesPorGeracao.get(urlGeracao)
}

function criarCard(nome, imagem, regiao, tipos){
    const card = document.createElement("div")
    card.classList.add("pokemon-card")

    const nome_pokemon = document.createElement("p")
    nome_pokemon.classList.add("pokemon-name")
    nome_pokemon.textContent = nome

    const imagem_pokemon = document.createElement("img")
    imagem_pokemon.classList.add("pokemon-image")
    imagem_pokemon.src = imagem
    imagem_pokemon.alt = nome

    card.append(imagem_pokemon, nome_pokemon)

    const regiao_div = document.createElement("div")
    regiao_div.classList.add("regiao")

    const nome_regiao = document.createElement("p")
    nome_regiao.classList.add("regiao-texto")
    nome_regiao.textContent = regiao

    regiao_div.append(nome_regiao)
    card.append(regiao_div)

    const tipos_box = document.createElement("div")
    tipos_box.classList.add("tipos-box")

    for(const element of tipos){
        const tipo = document.createElement("div")
        tipo.classList.add("tipo")

        const tipo_nome = document.createElement("p")
        tipo_nome.classList.add("tipo-texto")
        tipo_nome.textContent = element

        tipo.append(tipo_nome)
        tipos_box.append(tipo)
    }

    card.append(tipos_box)
    pokemons_area.append(card)
}

async function carregarPagina() {
    try {
        page_number.textContent = pagina_atual
        let pokemons = null
        if((pagina_atual + 1) * 20 > 1025){
            pokemons = await buscarPokemons(((pagina_atual + 1) * 20 - 1025), (pagina_atual - 1) * 20)
        }else{
            pokemons = await buscarPokemons(20, (pagina_atual - 1) * 20)
        }
        
        pokemons_area.replaceChildren()

        for(const element of pokemons.results) {
            const pokemon = await buscarPokemon(element.name)
            let nome = pokemon.name
            nome = nome[0].toUpperCase() + nome.slice(1, nome.length)
            const imagem = pokemon.sprites.front_default
            let regiao = await buscarRegiao(pokemon)
            regiao = regiao[0].toUpperCase() + regiao.slice(1, regiao.length)
            let tipos = []
            for(const element of pokemon["types"]){
                let tipo = element["type"]["name"]
                tipo = tipo[0].toUpperCase() + tipo.slice(1, tipo.length)
                tipos.push(tipo)
            }

            criarCard(nome, imagem, regiao, tipos)
        }
    } catch(erro) {
        console.error(erro)
    }
}

carregarPagina()