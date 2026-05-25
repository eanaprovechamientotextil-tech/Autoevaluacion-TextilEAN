export type SolicitudContext = {
  idEmpresa: string;
  numeroSolicitud: string;
  userId: string | null;
};

export type SolicitudContextResult = {
  context: SolicitudContext | null;
  hydratedSearch: string;
};
