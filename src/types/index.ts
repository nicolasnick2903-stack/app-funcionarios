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
