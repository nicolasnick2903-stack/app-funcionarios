export type Perfil = "funcionario" | "gestor" | "rh" | "admin";

export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  perfil: Perfil;
  cargo: string;
  setor: string;
  matricula: string;
  cpf?: string;
  dataNascimento?: string;
  avatarUrl?: string;
  ativo: boolean;
  criadoEm: string;
}

export type StatusPonto = "entrada" | "saida" | "pausa";

export interface RegistroPonto {
  id: string;
  uid: string;
  tipo: StatusPonto;
  dataHora: string;
  latitude?: number;
  longitude?: number;
  enderecoAproximado?: string;
  dispositivo?: string;
}

export type StatusSolicitacao = "pendente" | "aprovado" | "rejeitado";

export interface SolicitacaoFerias {
  id: string;
  uid: string;
  nomeFunc: string;
  dataInicio: string;
  dataFim: string;
  diasSolicitados: number;
  observacao?: string;
  status: StatusSolicitacao;
  criadoEm: string;
  atualizadoEm?: string;
  aprovadoPor?: string;
  motivoRejeicao?: string;
}

export type TipoAtestado = "medico" | "odontologico" | "psicologico" | "outro";

export interface Atestado {
  id: string;
  uid: string;
  nomeFunc: string;
  tipo: TipoAtestado;
  dataAfastamento: string;
  diasAfastamento: number;
  arquivoUrl: string;
  nomeArquivo: string;
  observacao?: string;
  status: StatusSolicitacao;
  criadoEm: string;
  atualizadoEm?: string;
  aprovadoPor?: string;
  motivoRejeicao?: string;
}

export interface Condominio {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  cnpj?: string;
  nomeSindico?: string;
  telefoneSindico?: string;
  emailSindico?: string;
  unidades?: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string;
}

export type CategoriaFornecedor =
  | "limpeza"
  | "segurança"
  | "manutenção"
  | "jardinagem"
  | "portaria"
  | "elétrica"
  | "hidráulica"
  | "pintura"
  | "outro";

export interface Fornecedor {
  id: string;
  nome: string;
  categoria: CategoriaFornecedor;
  cnpj?: string;
  nomeContato?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  observacao?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string;
}

export type TipoTransacao = "entrada" | "saida";

export type CategoriaTransacao =
  | "salario"
  | "fornecedor"
  | "manutencao"
  | "material"
  | "servico"
  | "taxa"
  | "outro";

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  categoria: CategoriaTransacao;
  condominioId?: string;
  condominioNome?: string;
  data: string;
  criadoEm: string;
  criadoPor: string;
  observacao?: string;
}

export type TipoAviso = "geral" | "urgente" | "rh" | "escala" | "treinamento";

export interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: TipoAviso;
  publicadoPor: string;
  publicadoEm: string;
  fixado: boolean;
  visivelPara: Perfil[] | "todos";
}
