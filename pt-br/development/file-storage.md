# Armazenamento nativo em arquivos

Este guia explica a arquitetura de persistência local do Marinara Engine. Para ver a organização das pastas do ponto de vista do usuário, veja [Onde Marinara salva os seus dados](../data/where-data-is-stored.md).

## Fonte da verdade

Marinara salva as linhas do aplicativo como snapshots JSON dentro da pasta `DATA_DIR/storage`:

```text
storage/
├── manifest.json
└── tables/
    ├── chats.json
    ├── messages.json
    ├── characters.json
    └── ...
```

A variável `FILE_STORAGE_DIR` permite trocar a pasta `storage` por outra. Cada arquivo de tabela contém um array JSON. O arquivo `manifest.json` registra a versão do formato de armazenamento, a hora em que os dados foram salvos, o identificador do backend e a contagem de linhas de cada tabela registrada.

## Modelo de execução

O arquivo `packages/server/src/db/file-backed-store.ts` carrega os snapshots das tabelas na memória durante a inicialização. O servidor lê e altera essas linhas pelas operações nativas de arquivo que o arquivo `db/file-query.ts` expõe. O arquivo `db/file-schema.ts` fornece metadados de tabela e de coluna à prova de colisão para as definições da pasta `db/schema/`.

A API fluente de `select`, `insert`, `update` e `delete` mantém os serviços de armazenamento enxutos, sem depender de um banco de dados externo nem de um ORM. Os filtros e as ordenações com suporte são objetos de expressão explícitos. Assim, a camada de armazenamento nunca faz parsing de strings de consulta.

As tabelas declaram chaves naturais com `fileTable(..., { uniqueBy: [...] })`. As inserções e as atualizações validam as chaves primárias e as chaves naturais declaradas contra a mudança candidata completa antes de alterar as linhas em memória. Se alguma restrição falhar, a tabela fica intacta. Uma regra pode incluir um predicado `when` quando a unicidade vale só para parte das linhas.

Os capability packages baixados podem trazer as próprias instâncias de tabela de arquivo. A camada de armazenamento resolve essas instâncias pelo nome de tabela registrado, depois de verificar a identidade dos objetos. Com isso, o código de armazenamento de um pacote usa as tabelas do Engine com segurança.

## Persistência e recuperação

As escritas marcam como sujas as tabelas afetadas. Um debounce curto agrupa as mudanças próximas, e um timer de segurança salva periodicamente o que ficou pendente. No desligamento controlado, Marinara espera as escritas ativas terminarem e depois persiste as linhas que mudaram durante essa escrita.

Marinara escreve cada snapshot em um arquivo temporário, força a gravação em disco e renomeia o arquivo de forma atômica. Antes da substituição, o snapshot íntegro anterior é atualizado como um arquivo `.bak`. Na inicialização, se o arquivo principal estiver ilegível, Marinara o recupera a partir do backup sempre que possível. Se nenhuma das duas cópias servir, Marinara põe os arquivos corrompidos em quarentena com um sufixo de data e hora e inicia vazia apenas aquela tabela, para que a interface continue acessível e a recuperação seja possível.

## Transações

As transações usam snapshots copy-on-write delimitados por `AsyncLocalStorage`. A tabela só é clonada quando a transação a altera pela primeira vez. Se o callback lançar um erro, apenas as tabelas alteradas por aquela transação são restauradas; as escritas concorrentes de outras partes continuam valendo.

## Como adicionar uma tabela

Ao adicionar dados persistentes:

1. Defina a tabela em `packages/server/src/db/schema/` com `fileTable` e os construtores de coluna nativos de arquivo.
2. Exporte a tabela no arquivo `db/schema/index.ts`.
3. Declare as chaves naturais com a opção de tabela `uniqueBy`.
4. Registre o nome da tabela em `FILE_BACKED_TABLES`.
5. Defina as relações em cascata ou de set-null no arquivo `file-backed-store.ts` quando for necessário.
6. Inclua os metadados de coluna JSON no arquivo `services/mari-db/mari-db.service.ts` quando um campo de texto contiver JSON estruturado.
7. Confirme o comportamento de backup e de restauração do perfil.
8. Execute `pnpm check` e as regressões de armazenamento relevantes.

Mantenha as definições de tabela, os metadados de relação, a portabilidade do perfil e a validação do Mari DB alinhados na mesma alteração.
