-- Habilitar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ========================================
-- TABELA: LEADS
-- ========================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'novo',
    comentarios TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para validar status
    CONSTRAINT chk_status CHECK (
        status IN ('novo', 'contato_inicial', 'em_negociacao', 'convertido', 'perdido')
    )
);

-- Índices para melhorar performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_cpf ON leads(cpf);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- ========================================
-- TABELA: PROPRIEDADES RURAIS
-- ========================================
CREATE TABLE IF NOT EXISTS propriedades_rurais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cultura VARCHAR(100),
    area_hectares DECIMAL(10, 2) NOT NULL,
    municipio VARCHAR(100),
    estado VARCHAR(2),
    geometria GEOMETRY(Polygon, 4326), -- PostGIS: Polígono com SRID 4326 (WGS84)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para validar área
    CONSTRAINT chk_area_positiva CHECK (area_hectares > 0)
);

-- Índices
CREATE INDEX idx_propriedades_lead_id ON propriedades_rurais(lead_id);
CREATE INDEX idx_propriedades_area ON propriedades_rurais(area_hectares);
CREATE INDEX idx_propriedades_municipio ON propriedades_rurais(municipio);
CREATE INDEX idx_propriedades_geometria ON propriedades_rurais USING GIST(geometria);

-- ========================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_propriedades_updated_at
    BEFORE UPDATE ON propriedades_rurais
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

